import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Platform } from "../types";
import { Activity, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface DashboardProps {
  platforms: Platform[];
  loading: boolean;
}

export function DashboardView({ platforms, loading }: DashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">总提交数</CardDescription>
            <CardTitle className="text-3xl font-light">128</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Activity className="w-3 h-3" />
              <span>+12% 本月</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">审核中</CardDescription>
            <CardTitle className="text-3xl font-light">5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <Clock className="w-3 h-3" />
              <span>平均耗时 2.4天</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">已通过</CardDescription>
            <CardTitle className="text-3xl font-light">112</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>成功率 94%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">被拒绝</CardDescription>
            <CardTitle className="text-3xl font-light text-destructive">11</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>需关注 2 项</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">平台实时状态</CardTitle>
            <CardDescription>各分发渠道 API 的最新同步情况</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[#F5F5F4]">
                  <TableHead className="text-[10px] uppercase font-bold">平台</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold">状态</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold">最后同步</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-right">延迟</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10">加载中...</TableCell></TableRow>
                ) : (
                  platforms.map(p => (
                    <TableRow key={p.id} className="border-[#F5F5F4]">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "connected" ? "secondary" : "destructive"} className="rounded-full px-2 py-0 text-[10px]">
                          {p.status === "connected" ? "正常" : "异常"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{p.lastSync}</TableCell>
                      <TableCell className="text-right text-xs font-mono">24ms</TableCell>
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
              {[
                { title: "华为审核通过", time: "10分钟前", type: "success" },
                { title: "小米版本上传成功", time: "1小时前", type: "info" },
                { title: "OPPO 凭据即将过期", time: "3小时前", type: "warning" },
                { title: "VIVO 审核被拒绝", time: "昨天", type: "error" },
              ].map((item, i) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
