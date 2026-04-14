import { useState, useEffect } from "react";
import { LayoutDashboard, Settings, Upload, Activity, Globe, ShieldCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Platform } from "./types";
import { PlatformConfigDialog } from "./components/PlatformConfigDialog";
import { UploadDialog } from "./components/UploadDialog";
import { DashboardView } from "./components/DashboardView";
import { PublishingView } from "./components/PublishingView";
import { StatusView } from "./components/StatusView";
import { ConfigView } from "./components/ConfigView";
import { cn } from "@/lib/utils";

type ViewType = "dashboard" | "publishing" | "status" | "config";

export default function App() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetch("/api/platforms")
      .then((res) => res.json())
      .then((data) => {
        setPlatforms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch platforms:", err);
        setLoading(false);
      });
  }, []);

  const handleConfigClick = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsConfigOpen(true);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <DashboardView platforms={platforms} loading={loading} />;
      case "publishing": return <PublishingView onUploadClick={() => setIsUploadOpen(true)} />;
      case "status": return <StatusView />;
      case "config": return <ConfigView platforms={platforms} onConfigClick={handleConfigClick} />;
      default: return <DashboardView platforms={platforms} loading={loading} />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "控制面板", icon: LayoutDashboard },
    { id: "publishing", label: "应用发布", icon: Upload },
    { id: "status", label: "审核状态", icon: Activity },
    { id: "config", label: "平台配置", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1A1A1A] font-sans flex">
      <Toaster position="top-right" />
      
      <PlatformConfigDialog 
        platform={selectedPlatform} 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
      
      <UploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E5E5E5] bg-white h-screen sticky top-0 hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-[#F5F5F4]">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span>多平台审核</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Button 
              key={item.id}
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-3 text-sm font-medium h-10 px-3 transition-all",
                currentView === item.id ? "bg-[#F5F5F4] text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setCurrentView(item.id as ViewType)}
            >
              <item.icon className={cn("w-4 h-4", currentView === item.id ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-[#F5F5F4]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F4]/50 border border-[#F5F5F4]">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">chengweidan9</p>
              <p className="text-[10px] text-muted-foreground">开发者账户</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto p-8">
          <header className="mb-8 md:hidden flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span>多平台审核</span>
            </div>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </header>

          {renderView()}
        </div>
      </main>
    </div>
  );
}



