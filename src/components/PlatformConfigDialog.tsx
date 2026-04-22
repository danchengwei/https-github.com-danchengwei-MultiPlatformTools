import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Platform } from "../types";
import { toast } from "sonner";

interface PlatformConfigDialogProps {
  platform: Platform | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformConfigDialog({ platform, isOpen, onClose }: PlatformConfigDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [appId, setAppId] = useState("");

  const handleSave = async () => {
    const config = {
      appId,
      apiKey,
      apiSecret,
    };

    try {
      const response = await fetch(`/api/platforms/${platform?.id}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success(`${platform?.name} 配置已保存并建立连接`);
        onClose();
        // In a real app, we'd use a context or global state to refresh
        window.location.reload(); 
      } else {
        toast.error("保存失败");
      }
    } catch (error) {
      toast.error("网络错误");
    }
  };

  if (!platform) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>配置 {platform.name}</DialogTitle>
          <DialogDescription>
            请输入该平台的 API 凭据。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <h4 className="text-sm font-bold border-b pb-1">平台 API 凭据</h4>
            <div className="grid gap-2">
              <Label htmlFor="appId">App ID</Label>
              <Input id="appId" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="请输入 App ID" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key / Client ID</Label>
              <Input id="apiKey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="请输入 API Key" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiSecret">API Secret / Client Secret</Label>
              <Input id="apiSecret" type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="请输入 API Secret" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSave}>保存配置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
