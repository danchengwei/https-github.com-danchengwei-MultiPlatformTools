import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileCode, Trash2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export function PublishingView({ onUploadClick }: { onUploadClick: () => void }) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages")
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此安装包吗？")) return;
    
    try {
      const response = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== id));
        toast.success("安装包已删除");
      }
    } catch (error) {
      toast.error("删除失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">应用发布管理</h2>
          <p className="text-muted-foreground text-sm">上传、管理并分发您的应用安装包</p>
        </div>
        <Button onClick={onUploadClick} className="gap-2">
          <Upload className="w-4 h-4" />
          上传新版本
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg">已上传包列表</CardTitle>
          <CardDescription>管理已上传到服务器的 APK 文件</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#F5F5F4]">
                <TableHead className="text-[10px] uppercase font-bold">文件名</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">架构</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">大小</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">上传时间</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">状态</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">加载中...</TableCell></TableRow>
              ) : files.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">暂无上传包</TableCell></TableRow>
              ) : (
                files.map((file, i) => (
                  <TableRow key={i} className="border-[#F5F5F4] group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-muted-foreground" />
                        {file.originalName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">{file.architecture}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{file.uploadDate}</TableCell>
                    <TableCell>
                      <Badge variant={file.status === "ready" ? "secondary" : "outline"} className="text-[10px]">
                        {file.status === "ready" ? "就绪" : "已归档"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(file.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold">分发策略</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#F5F5F4]">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">自动提审</p>
                <p className="text-xs text-muted-foreground">上传完成后自动提交至应用商店审核</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#F5F5F4]">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">分阶段发布</p>
                <p className="text-xs text-muted-foreground">仅对 10% 的用户开放更新</p>
              </div>
              <input type="checkbox" className="rounded border-gray-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold">包体校验</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#F5F5F4]">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">V2 签名校验</p>
                <p className="text-xs text-green-600 font-medium">已通过</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#F5F5F4]">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">权限敏感项检查</p>
                <p className="text-xs text-muted-foreground">发现 2 项敏感权限请求</p>
              </div>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
