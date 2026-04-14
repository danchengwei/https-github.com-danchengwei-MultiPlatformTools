import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Filter, MessageSquare, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StatusView() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audits")
      .then(res => res.json())
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reviewing": return <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">审核中</Badge>;
      case "approved": return <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50">已通过</Badge>;
      case "rejected": return <Badge className="bg-red-50 text-red-700 border-red-100 hover:bg-red-50">被拒绝</Badge>;
      default: return <Badge variant="outline">未知</Badge>;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此审核记录吗？")) return;
    
    try {
      const response = await fetch(`/api/audits/${id}`, { method: "DELETE" });
      if (response.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id));
        toast.success("记录已删除");
      }
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetch("/api/audits")
      .then(res => res.json())
      .then(data => {
        setSubmissions(data);
        setLoading(false);
        toast.success("状态已同步");
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">审核状态追踪</h2>
          <p className="text-muted-foreground text-sm">实时查看并管理各平台的审核进度与反馈</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white border-none shadow-sm gap-2" onClick={handleRefresh}>
            <History className="w-3 h-3" />
            同步状态
          </Button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 w-[200px] bg-white border-none shadow-sm" placeholder="搜索版本或备注..." />
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#F5F5F4]">
                <TableHead className="pl-6 text-[10px] uppercase font-bold">平台</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">版本/备注</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">提交时间</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">当前状态</TableHead>
                <TableHead className="text-[10px] uppercase font-bold">反馈</TableHead>
                <TableHead className="pr-6 text-right text-[10px] uppercase font-bold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">加载中...</TableCell></TableRow>
              ) : submissions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">暂无审核记录</TableCell></TableRow>
              ) : (
                submissions.map((s, i) => (
                  <TableRow key={i} className="border-[#F5F5F4] group">
                    <TableCell className="pl-6 font-semibold capitalize">{s.platformId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{s.version}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{s.notes}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{s.submitDate}</TableCell>
                    <TableCell>{getStatusBadge(s.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {s.feedback || "等待平台反馈..."}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                          <History className="w-3 h-3" />
                          详情
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
    </div>
  );
}