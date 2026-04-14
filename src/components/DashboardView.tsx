import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Platform } from "../types";
import { Activity, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface DashboardProps {
  platforms: Platform[];
  loading: boolean;
}

interface Stats {
  totalSubmissions: number;
  reviewing: number;
  approved: number;
  rejected: number;
  connectedPlatforms: number;
}

export function DashboardView({ platforms, loading }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data));

    fetch("/api/audits")
      .then(res => res.json())
      .then(data => {
        // Map audits to simple activity objects
        const recent = data.slice(0, 5).map((a: any) => ({
          title: `${a.platformId.toUpperCase()} 提交: ${a.status === 'reviewing' ? '审核中' : a.status === 'approved' ? '已通过' : '被拒绝'}`,
          time: a.submitDate,
          type: a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'error' : 'info'
        }));
        setActivities(recent);
      });
  }, []);

  const connectedPlatforms = platforms.filter(p => p.status === "connected");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">总提交数</CardDescription>
            <CardTitle className="text-3xl font-light">{stats?.totalSubmissions ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Activity className="w-3 h-3" />
              <span>实时统计</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">审核中</CardDescription>
            <CardTitle className="text-3xl font-light">{stats?.reviewing ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <Clock className="w-3 h-3" />
              <span>等待平台反馈</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">已通过</CardDescription>
            <CardTitle className="text-3xl font-light">{stats?.approved ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>审核成功包</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">被拒绝</CardDescription>
            <CardTitle className="text-3xl font-light text-destructive">{stats?.rejected ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>需要修正</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">已配置平台状态</CardTitle>
            <CardDescription>仅展示已建立 API 连接的平台</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[#F5F5F4]">
                  <TableHead className="text-[10px] uppercase font-bold">平台</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold">状态</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold">最后同步</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-right">API 延迟</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10">加载中...</TableCell></TableRow>
                ) : connectedPlatforms.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">尚未配置任何平台</TableCell></TableRow>
                ) : (
                  connectedPlatforms.map(p => (
                    <TableRow key={p.id} className="border-[#F5F5F4]">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-none rounded-full px-2 py-0 text-[10px]">
                          已连接
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{p.lastSync}</TableCell>
                      <TableCell className="text-right text-xs font-mono">--</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">最近动态</CardTitle>
            <CardDescription>系统操作与审核通知</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">暂无动态</p>
              ) : (
                activities.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      item.type === "success" ? "bg-green-500" : 
                      item.type === "error" ? "bg-red-500" : 
                      item.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    <div>
                      <p className="text-sm font-medium leading-none">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
