import { useState } from "react";
import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileCode, CheckCircle2 } from "lucide-react";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [architecture, setArchitecture] = useState<"32-bit" | "64-bit" | "Universal">("Universal");
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("architecture", architecture);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        setStep(2);
        toast.success(`${architecture} APK 上传成功，准备分发`);
      } else {
        toast.error("上传失败，请重试");
      }
    } catch (error) {
      toast.error("网络错误");
    } finally {
      setUploading(false);
    }
  };

  const handleDistribute = () => {
    // In a real app, this would call /api/submit
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platformIds: ["huawei", "xiaomi", "vivo", "tencent"],
        filename: file?.name,
        architecture: architecture
      })
    });
    
    toast.success(`已加入分发队列 (${architecture})，正在同步至各平台`);
    onClose();
    setStep(1);
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "上传新版本" : "确认分发"}</DialogTitle>
          <DialogDescription>
            {step === 1 ? "选择您的 APK 文件并指定架构。" : "文件已就绪，请选择要分发的平台。"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">应用架构</Label>
              <div className="flex gap-2">
                {["32-bit", "64-bit", "Universal"].map((arch) => (
                  <Button
                    key={arch}
                    variant={architecture === arch ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setArchitecture(arch as any)}
                  >
                    {arch}
                  </Button>
                ))}
              </div>
            </div>

            <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E5E5] rounded-xl bg-[#FBFBFA]">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <Input 
                type="file" 
                accept=".apk" 
                className="hidden" 
                id="apk-upload" 
                onChange={handleFileChange}
              />
              <Label htmlFor="apk-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>{file ? file.name : "选择 APK 文件"}</span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-4">支持 .apk 格式，最大 2GB</p>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900">{file?.name}</p>
                <p className="text-xs text-green-700">校验通过，准备就绪</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">分发平台</Label>
              <div className="grid grid-cols-2 gap-2">
                {["华为", "小米", "VIVO", "腾讯"].map(p => (
                  <div key={p} className="flex items-center gap-2 p-2 border rounded-md text-sm">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          {step === 1 ? (
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "上传中..." : "开始上传"}
            </Button>
          ) : (
            <Button onClick={handleDistribute}>确认并分发</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
