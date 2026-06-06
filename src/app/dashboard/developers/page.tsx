"use client";
export const dynamic = 'force-dynamic';


import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Key, Copy, Plus, Trash2, CheckCircle2, Terminal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DevelopersPage() {
  const keys = useQuery(api.apiKeys.listKeys);
  const createKey = useMutation(api.apiKeys.createKey);
  const revokeKey = useMutation(api.apiKeys.revokeKey);

  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const keyStr = await createKey({ name: newKeyName });
      setNewlyCreatedKey(keyStr);
      setNewKeyName("");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold">Developer Portal</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Manage your API keys to integrate Metaphor IO into other platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Creation Form */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-6 border-white/5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New Key
              </h2>
              
              <form onSubmit={handleCreateKey} className="space-y-4">
                <GlassInput
                  label="Key Name"
                  placeholder="e.g. Linear Production"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  required
                />
                <GlassButton
                  type="submit"
                  loading={isCreating}
                  className="w-full justify-center"
                >
                  Generate Key
                </GlassButton>
              </form>

              {newlyCreatedKey && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 mb-2 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Key generated successfully!
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    Copy this key now. You won't be able to see it again.
                  </p>
                  <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg border border-white/5">
                    <code className="text-xs text-emerald-300 truncate flex-1 select-all">
                      {newlyCreatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey, "new")}
                      className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                    >
                      {copiedId === "new" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Key List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Key className="w-4 h-4" /> Active Keys
            </h2>

            {!keys ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : keys.length === 0 ? (
              <GlassCard className="p-12 text-center border-dashed border-white/10 bg-transparent">
                <Key className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No API keys generated yet.</p>
              </GlassCard>
            ) : (
              keys.map((k) => (
                <GlassCard key={k._id} className={`p-5 transition-all ${!k.isActive ? "opacity-50 grayscale" : "hover:border-white/20"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white">{k.name}</h3>
                        {!k.isActive && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                            Revoked
                          </span>
                        )}
                        {k.isActive && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <code className="text-xs text-slate-500 bg-black/50 px-2 py-1 rounded">
                        {k.key.substring(0, 10)}••••••••••••••••••••
                      </code>
                      <p className="text-xs text-slate-500 mt-3">
                        Created: {formatDistanceToNow(new Date(k._creationTime))} ago
                        {k.lastUsed ? ` • Last used: ${formatDistanceToNow(new Date(k.lastUsed))} ago` : " • Never used"}
                      </p>
                    </div>

                    {k.isActive && (
                      <GlassButton
                        size="sm"
                        variant="secondary"
                        onClick={() => revokeKey({ id: k._id })}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </GlassButton>
                    )}
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
