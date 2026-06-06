"use client";
export const dynamic = 'force-dynamic';


import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRightLeft,
  Zap,
  AlertTriangle,
  Activity,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "bg-green-500/10 text-green-400 border-green-500/20",
  claude: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  gemini: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  linear: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  notion: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  generic: "bg-white/5 text-slate-400 border-white/10",
};

function platformStyle(name: string) {
  return PLATFORM_COLORS[name.toLowerCase()] ?? PLATFORM_COLORS.generic;
}

export default function TransfersPage() {
  const stats = useQuery(api.transfers.getTransferStats);
  const transfers = useQuery(api.transfers.getTransfers, { limit: 50 });

  const maxBar = stats
    ? Math.max(...(stats.recentActivity?.map((d) => d.count) ?? [1]), 1)
    : 1;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ArrowRightLeft className="w-7 h-7 text-blue-400" />
              Transfer Log
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Every time your context was injected into a platform.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={<ArrowRightLeft className="w-5 h-5 text-blue-400" />}
            label="Total Transfers"
            value={stats?.total ?? "…"}
            color="blue"
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            label="Avg. Speed"
            value={stats ? `${stats.avgTransferMs}ms` : "…"}
            color="amber"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            label="Manual Fix Rate"
            value={stats ? `${stats.manualFixRate}%` : "…"}
            color="red"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-emerald-400" />}
            label="Platforms"
            value={stats ? Object.keys(stats.platformBreakdown).length : "…"}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transfer History Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> History
            </h2>

            {!transfers ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/3 animate-pulse" />
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <GlassCard className="p-16 text-center border-dashed border-white/5 bg-transparent">
                <ArrowRightLeft className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-slate-400 font-medium mb-2">No transfers yet</h3>
                <p className="text-slate-600 text-sm max-w-xs mx-auto">
                  Transfers are logged automatically when platforms use your context via the API.
                </p>
              </GlassCard>
            ) : (
              transfers.map((t: any) => (
                <GlassCard key={t._id} className="p-5 hover:border-white/15 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    {/* Flow */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border font-medium uppercase tracking-wider ${platformStyle(t.sourcePlatform)}`}>
                        {t.sourcePlatform}
                      </span>
                      <ArrowRightLeft className="w-4 h-4 text-slate-600 shrink-0" />
                      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border font-medium uppercase tracking-wider ${platformStyle(t.targetPlatform)}`}>
                        {t.targetPlatform}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-3 justify-end mb-1">
                        {t.transferTimeMs && (
                          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                            <Zap className="w-3 h-3" />{t.transferTimeMs}ms
                          </span>
                        )}
                        {t.manualFixesRequired && (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> manual fix
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {formatDistanceToNow(new Date(t._creationTime))} ago
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* 7-day Activity Sparkline */}
            <GlassCard className="p-5 border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> 7-Day Activity
              </h3>
              {stats && stats.recentActivity.length > 0 ? (
                <div className="flex items-end gap-1.5 h-24">
                  {stats.recentActivity.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className="w-full rounded-sm bg-blue-500/30 hover:bg-blue-500/50 transition-colors"
                        style={{ height: `${Math.max((d.count / maxBar) * 80, d.count > 0 ? 8 : 2)}px` }}
                        title={`${d.count} transfer${d.count !== 1 ? "s" : ""}`}
                      />
                      <span className="text-[10px] text-slate-600">{d.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-slate-700 text-sm">
                  No data yet
                </div>
              )}
            </GlassCard>

            {/* Platform Breakdown */}
            <GlassCard className="p-5 border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">
                Platform Breakdown
              </h3>
              {stats && Object.keys(stats.platformBreakdown).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.platformBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([platform, count]) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={platform}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium uppercase tracking-wider ${platformStyle(platform)}`}>
                              {platform}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{count} · {pct}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500/50 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-slate-700 text-sm text-center py-4">No transfers yet</p>
              )}
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "blue" | "amber" | "red" | "emerald";
}) {
  const borderMap = {
    blue: "border-blue-500/20",
    amber: "border-amber-500/20",
    red: "border-red-500/20",
    emerald: "border-emerald-500/20",
  };

  return (
    <GlassCard className={`p-5 ${borderMap[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </GlassCard>
  );
}
