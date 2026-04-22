import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { HuaweiPlatform } from "./platforms/huawei";
import { XiaomiPlatform } from "./platforms/xiaomi";
import { OppoPlatform, VivoPlatform } from "./platforms/oppo_vivo";
import { HonorAutomation } from "./src/services/honorAutomation";
import { getDb } from "./src/lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const db = await getDb();

  // Migration: Ensure Honor platform and portalUrls exist in existing db.json
  await db.update(({ platforms }) => {
    const portalUrls: Record<string, string> = {
      huawei: "https://developer.huawei.com/consumer/cn/service/josp/agc/index.html",
      honor: "https://developer.honor.com/cn",
      xiaomi: "https://dev.mi.com/console/",
      oppo: "https://open.oppomobile.com/",
      vivo: "https://developer.vivo.com.cn/",
      tencent: "https://open.tencent.com/",
      ali: "https://open.uc.cn/"
    };

    const hasHonor = platforms.find(p => p.id === "honor");
    if (!hasHonor) {
      platforms.splice(1, 0, { id: "honor", name: "荣耀 (Honor Search)", status: "disconnected", lastSync: "-", portalUrl: portalUrls.honor });
    }

    platforms.forEach(p => {
      if (!p.portalUrl && portalUrls[p.id]) {
        p.portalUrl = portalUrls[p.id];
      }
    });

    if (!db.data.botConfig) {
      (db.data as any).botConfig = { appId: "", appSecret: "", enabled: false };
    }
  });

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

  app.get("/api/stats", (req, res) => {
    const audits = db.data.audits;
    const stats = {
      totalSubmissions: audits.length,
      reviewing: audits.filter(a => a.status === "reviewing").length,
      approved: audits.filter(a => a.status === "approved").length,
      rejected: audits.filter(a => a.status === "rejected").length,
      connectedPlatforms: db.data.platforms.filter(p => p.status === "connected").length
    };
    res.json(stats);
  });

  // Background Sync Task (Every 5 minutes)
  const syncWithOfficialApis = async () => {
    console.log("[Background Sync] Starting sync with official APIs...");
    const connectedPlatforms = db.data.platforms.filter(p => p.status === "connected");
    
    for (const platform of connectedPlatforms) {
      const config = platform.config;
      if (!config) continue;

      try {
        let latestStatus: 'reviewing' | 'approved' | 'rejected' | null = null;

        // Real API logic based on platform
        if (platform.id === "huawei") {
          const hw = new HuaweiPlatform(config.apiKey, config.apiSecret);
          // const apiResponse = await hw.getAppStatus(config.appId);
          // latestStatus = apiResponse === '5' ? 'approved' : 'reviewing'; 
        } else if (platform.id === "xiaomi") {
          const mi = new XiaomiPlatform(config.appId, config.apiKey, config.apiSecret);
          // const apiResponse = await mi.getAuditStatus(config.appId);
          // latestStatus = apiResponse.status === 'PASSED' ? 'approved' : 'reviewing';
        } else if (platform.id === "honor") {
          // Use Playwright automation for Honor platform
          if (config.apiKey && config.apiSecret) {
            console.log("[Background Sync] Starting Honor automation sync...");
            const honor = new HonorAutomation(config.apiKey, config.apiSecret);
            const status = await honor.getAppStatus(config.appId);
            if (status !== 'unknown') {
              latestStatus = status as 'reviewing' | 'approved' | 'rejected';
            }
          }
        }

        // Update local audits for this platform if status changed
        if (latestStatus) {
          await db.update(({ audits }) => {
            audits.forEach(audit => {
              if (audit.platformId === platform.id && audit.status === 'reviewing') {
                audit.status = latestStatus!;
                audit.feedback = `Synced from official API at ${new Date().toLocaleString()}`;
              }
            });
          });
        }
        
        // Update last sync time for the platform
        await db.update(({ platforms }) => {
          const p = platforms.find(item => item.id === platform.id);
          if (p) p.lastSync = new Date().toLocaleString();
        });
      } catch (error) {
        console.error(`[Background Sync] Failed for ${platform.id}:`, error);
      }
    }
    console.log("[Background Sync] Completed.");
  };

  // Run sync every 5 minutes
  setInterval(syncWithOfficialApis, 5 * 60 * 1000);

  app.get("/api/platforms", (req, res) => {
    res.json(db.data.platforms);
  });

  app.post("/api/platforms/:id/config", async (req, res) => {
    const { id } = req.params;
    const { appId, apiKey, apiSecret } = req.body;
    
    await db.update(({ platforms }) => {
      const platform = platforms.find(p => p.id === id);
      if (platform) {
        platform.config = { appId, apiKey, apiSecret };
        platform.status = "connected";
        platform.lastSync = new Date().toLocaleString();
      }
    });
    
    res.json({ message: "Configuration saved", status: "connected" });
  });

  app.get("/api/bot/config", (req, res) => {
    res.json(db.data.botConfig);
  });

  app.post("/api/bot/config", async (req, res) => {
    const config = req.body;
    await db.update((data) => {
      data.botConfig = config;
    });
    res.json({ message: "Bot configuration saved" });
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
