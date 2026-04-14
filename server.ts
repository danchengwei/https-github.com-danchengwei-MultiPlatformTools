import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { HuaweiPlatform } from "./platforms/huawei";
import { XiaomiPlatform } from "./platforms/xiaomi";
import { OppoPlatform, VivoPlatform } from "./platforms/oppo_vivo";
import { getDb } from "./src/lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const db = await getDb();

  // Configure multer for APK uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/platforms", (req, res) => {
    res.json(db.data.platforms);
  });

  app.post("/api/platforms/:id/config", async (req, res) => {
    const { id } = req.params;
    const config = req.body;
    
    await db.update(({ platforms }) => {
      const platform = platforms.find(p => p.id === id);
      if (platform) {
        platform.config = config;
        platform.status = "connected";
        platform.lastSync = new Date().toLocaleString();
      }
    });
    
    res.json({ message: "Configuration saved", status: "connected" });
  });

  app.post("/api/platforms/:id/sync", async (req, res) => {
    const { id } = req.params;
    const platform = db.data.platforms.find(p => p.id === id);
    const config = platform?.config;
    
    if (!config) {
      return res.status(400).json({ error: "Platform not configured" });
    }

    try {
      // Real API logic based on platform
      if (id === "huawei") {
        const hw = new HuaweiPlatform(config.apiKey, config.apiSecret);
        await hw.getAccessToken();
      } else if (id === "xiaomi") {
        const mi = new XiaomiPlatform(config.appId, config.apiKey, config.apiSecret);
        await mi.getAuditStatus(config.appId);
      }
      
      await db.update(({ platforms }) => {
        const p = platforms.find(item => item.id === id);
        if (p) {
          p.lastSync = new Date().toLocaleString();
          p.status = "connected";
        }
      });

      res.json(db.data.platforms.find(p => p.id === id));
    } catch (error) {
      console.error(`Sync failed for ${id}:`, error);
      res.status(500).json({ error: "Sync failed with official API" });
    }
  });

  app.get("/api/packages", (req, res) => {
    res.json(db.data.packages);
  });

  app.delete("/api/packages/:id", async (req, res) => {
    const { id } = req.params;
    await db.update(({ packages }) => {
      const index = packages.findIndex(p => p.id === id);
      if (index !== -1) packages.splice(index, 1);
    });
    res.json({ message: "Package deleted" });
  });

  app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    const { architecture } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newPackage = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      architecture: architecture || "Universal",
      uploadDate: new Date().toLocaleString(),
      status: "ready" as const
    };

    await db.update(({ packages }) => {
      packages.unshift(newPackage);
    });

    res.json(newPackage);
  });

  app.get("/api/audits", async (req, res) => {
    // Trigger sync with official APIs for active audits
    const connectedPlatforms = db.data.platforms.filter(p => p.status === "connected");
    
    for (const platform of connectedPlatforms) {
      const config = platform.config;
      if (!config) continue;

      try {
        // Simulate fetching latest status from official API
        if (platform.id === "huawei") {
          const hw = new HuaweiPlatform(config.apiKey, config.apiSecret);
          // await hw.getAppStatus(config.appId);
        } else if (platform.id === "xiaomi") {
          const mi = new XiaomiPlatform(config.appId, config.apiKey, config.apiSecret);
          // await mi.getAuditStatus(config.appId);
        }
      } catch (e) {
        console.error(`Background sync failed for ${platform.id}`);
      }
    }
    
    res.json(db.data.audits);
  });

  app.delete("/api/audits/:id", async (req, res) => {
    const { id } = req.params;
    await db.update(({ audits }) => {
      const index = audits.findIndex(a => a.id === id);
      if (index !== -1) audits.splice(index, 1);
    });
    res.json({ message: "Audit record deleted" });
  });

  app.post("/api/submit", async (req, res) => {
    const { platformIds, filename, architecture } = req.body;
    
    const pkg = db.data.packages.find(p => p.filename === filename || p.originalName === filename);
    
    for (const platformId of platformIds) {
      const newAudit = {
        id: Math.random().toString(36).substr(2, 9),
        platformId,
        packageId: pkg?.id || "unknown",
        version: "v1.0.0", // In real app, extract from APK
        status: "reviewing" as const,
        submitDate: new Date().toLocaleString(),
        notes: `Architecture: ${architecture}`
      };

      await db.update(({ audits }) => {
        audits.unshift(newAudit);
      });
    }

    // Simulate background processing and bot notification
    setTimeout(async () => {
      console.log(`[Bot Notification] App ${filename} (${architecture}) has been submitted to ${platformIds.length} platforms.`);
    }, 5000);

    res.json({ message: "Submission started", count: platformIds.length });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
