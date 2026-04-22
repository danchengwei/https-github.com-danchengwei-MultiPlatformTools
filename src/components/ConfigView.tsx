import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Platform } from "../types";
import { Settings2, Bot, Key, ShieldCheck, RefreshCw, Globe, ExternalLink } from "lucide-react";
import { BotConfigDialog } from "./BotConfigDialog";

interface ConfigViewProps {
  platforms: Platform[];
  onConfigClick: (platform: Platform) => void;
}

export function ConfigView({ platforms, onConfigClick }: ConfigViewProps) {
  const [isBotDialogOpen, setIsBotDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">平台配置中心</h2>
          <p className="text-muted-foreground text-sm">管理各应用商店的 API 凭据与自动化通知设置</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-white border-none shadow-sm" onClick={() => setIsBotDialogOpen(true)}>
            <Bot className="w-4 h-4" />
            配置全局机器人
          </Button>
          <Button variant="outline" className="gap-2 bg-white border-none shadow-sm">
            <RefreshCw className="w-4 h-4" />
            刷新所有连接
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card key={platform.id} className="border-none shadow-sm bg-white overflow-hidden group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] flex items-center justify-center">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  {platform.portalUrl && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      asChild
                    >
                      <a href={platform.portalUrl} target="_blank" rel="noopener noreferrer" title="访问开发者官网">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  <Badge variant={platform.status === "connected" ? "secondary" : "destructive"} className="rounded-full px-2 py-0 text-[10px]">
                    {platform.status === "connected" ? "已连接" : "未配置"}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg mt-4">{platform.name}</CardTitle>
              <CardDescription className="text-xs">
                {platform.status === "connected" ? `最后同步: ${platform.lastSync}` : "尚未建立 API 连接"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                  <Key className="w-3 h-3" />
                  API 凭据
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                  <Globe className="w-3 h-3" />
                  官网链接
                </div>
                <div className="text-xs font-medium">
                  {platform.status === "connected" ? "已配置" : "待配置"}
                </div>
                <div className="text-xs font-medium">
                  <a href={platform.portalUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">点击访问</a>
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                className="w-full gap-2 text-xs font-semibold bg-[#F5F5F4] hover:bg-[#E5E5E5] transition-colors"
                onClick={() => onConfigClick(platform)}
              >
                <Settings2 className="w-3 h-3" />
                管理配置
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-primary/5 border-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-base">安全提示</CardTitle>
              <CardDescription className="text-xs">所有 API 密钥均经过加密存储，仅用于与官方开放平台进行通信。</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <BotConfigDialog isOpen={isBotDialogOpen} onClose={() => setIsBotDialogOpen(false)} />
    </div>
  );
}
