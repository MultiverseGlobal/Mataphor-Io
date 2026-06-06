"use client";
export const dynamic = 'force-dynamic';


import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import {
  Zap,
  Layers,
  ArrowRightLeft,
  History,
  ExternalLink,
  Settings,
  LogOut,
  User,
  BarChart3,
  Activity,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();

  const profile = useQuery(api.profiles.getActiveProfile);
  const contexts = useQuery(api.contexts.getRecentContexts, { limit: 10 });
  const contextCount = useQuery(api.contexts.getContextCount);
  const transferStats = useQuery(api.transfers.getTransferStats);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isLoaded = profile !== undefined;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-blue-500/30">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="font-bold text-white text-sm">M</span>
              </div>
              <span className="text-sm text-slate-500 font-medium tracking-wide uppercase">Metaphor IO</span>
            </div>
            <h1 className="text-3xl font-bold">Control Plane</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {isLoaded && profile
                ? `Active profile: ${profile.name} · v${profile.version}`
                : "Loading your context infrastructure…"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <GlassButton size="sm" variant="secondary" className="rounded-full flex items-center gap-2">
                <User className="w-4 h-4" />
                Edit Profile
              </GlassButton>
            </Link>
            <Link href="/dashboard/settings">
              <GlassButton size="sm" variant="secondary" className="rounded-full flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </GlassButton>
            </Link>
            <GlassButton
              size="sm"
              variant="secondary"
              className="rounded-full flex items-center gap-2 text-red-400 hover:text-red-300"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </GlassButton>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Profile Status */}
          <GlassCard className="p-6 border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Context Profile</p>
                <p className="text-2xl font-bold">
                  {isLoaded ? (profile ? `v${profile.version}` : "None") : "…"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {profile ? profile.name : "No active profile"}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Transfer Count */}
          <GlassCard className="p-6 border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Transfers</p>
                <p className="text-2xl font-bold">{transferStats?.total ?? "…"}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {transferStats ? `${transferStats.avgTransferMs}ms avg` : "All platforms"}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Manual Fix Rate */}
          <GlassCard className="p-6 border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fix Rate</p>
                <p className="text-2xl font-bold">{transferStats ? `${transferStats.manualFixRate}%` : "…"}</p>
                <p className="text-xs text-slate-500 mt-0.5">Manual fixes needed</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Context History */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Captures
            </h2>

            {!contexts ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-white/3 animate-pulse" />
                ))}
              </div>
            ) : contexts.length === 0 ? (
              <GlassCard className="p-12 text-center border-dashed border-white/10 bg-transparent">
                <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-slate-300 font-medium mb-2">No contexts yet</h3>
                <p className="text-slate-600 text-sm max-w-xs mx-auto">
                  Install the Chrome Extension and open a conversation on ChatGPT, Claude, or Gemini.
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {contexts.map((ctx: any) => (
                  <GlassCard key={ctx._id} className="p-5 hover:border-white/20 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ctx.sourcePlatform === "chatgpt"
                              ? "bg-green-500/10 text-green-400"
                              : ctx.sourcePlatform === "claude"
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {ctx.sourcePlatform}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(ctx._creationTime))} ago
                          </span>
                        </div>
                        <h3 className="text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                          {ctx.structuredContext?.summary || ctx.structuredContext?.coreIntent?.slice(0, 80) || "Untitled Context"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {ctx.slug && (
                          <Link href={`/c/${ctx.slug}`} target="_blank">
                            <GlassButton size="sm" variant="secondary" className="p-2 h-8 w-8">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </GlassButton>
                          </Link>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Quick Actions
              </h3>
              <div className="space-y-2">
                <Link href="/profile" className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/7 transition-colors group">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Edit Context Profile</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                </Link>
                <Link href="/dashboard/transfers" className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/7 transition-colors group">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Transfer Log</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                </Link>
                <Link href="/dashboard/developers" className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/7 transition-colors group">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Developer Portal</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                </Link>
              </div>
            </GlassCard>

            {/* Connected Platforms */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Platforms</h3>
              <div className="space-y-2">
                {[
                  { name: "ChatGPT", status: "connected" },
                  { name: "Claude", status: "connected" },
                  { name: "Gemini", status: "connected" },
                  { name: "Generic", status: "connected" },
                ].map(({ name, status }) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-white/3">
                    <span className="text-sm text-slate-300">{name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded border border-emerald-500/20 font-medium uppercase tracking-wider">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
