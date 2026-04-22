import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface BotConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BotConfigDialog({ isOpen, onClose }: BotConfigDialogProps) {
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/bot/config")
        .then(res => res.json())
        .then(data => {
          setAppId(data.appId || "");
          setAppSecret(data.appSecret || "");
          setEnabled(data.enabled || false);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSave = async () => {
    const config = { appId, appSecret, enabled };

    try {
      const response = await fetch("/api/bot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success("全局机器人配置已保存");
        onClose();
      } else {
        toast.error("保存失败");
      }
    } catch (error) {
      toast.error("网络错误");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>全局消息通知机器人配置</DialogTitle>
          <DialogDescription>
            配置统一的 Webhook 机器人，用于接收所有平台的审核状态变更通知。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between space-x-2 border-b pb-4">
            <Label htmlFor="bot-enabled" className="flex flex-col space-y-1">
              <span>启用通知</span>
              <span className="font-normal text-xs text-muted-foreground">开启后，系统将自动发送审核状态变更通知</span>
            </Label>
            <Switch id="bot-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="botAppId">机器人 App ID</Label>
            <Input id="botAppId" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="请输入机器人 App ID" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="botAppSecret">机器人 App Secret</Label>
            <Input id="botAppSecret" type="password" value={appSecret} onChange={(e) => setAppSecret(e.target.value)} placeholder="请输入机器人 App Secret" />
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
