import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import Link from 'next/link';
import { 
    Zap, 
    History, 
    Layers, 
    ArrowRightLeft, 
    Search,
    ExternalLink,
    Clock,
    Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function DashboardPage() {
    const supabase = await createServerClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/auth');
    }

    // Fetch stats
    const { count: contextCount } = await supabase
        .from('contexts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

    const { count: transferCount } = await supabase
        .from('transfers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

    // Fetch recent contexts
    const { data: recentContexts } = await supabase
        .from('contexts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Context Vault
                        </h1>
                        <p className="text-slate-400 mt-2">Manage and transfer your AI conversation states.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/settings">
                            <GlassButton size="sm" variant="secondary" className="rounded-full flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </GlassButton>
                        </Link>
                        <GlassButton size="sm" className="rounded-full flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            New Transfer
                        </GlassButton>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <GlassCard className="p-6 border-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Contexts</p>
                                <p className="text-2xl font-bold">{contextCount || 0}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border-purple-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                <ArrowRightLeft className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Successful Transfers</p>
                                <p className="text-2xl font-bold">{transferCount || 0}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border-pink-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Avg. Transfer Time</p>
                                <p className="text-2xl font-bold">~4s</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Contexts List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-400" />
                                Recent Contexts
                            </h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search contexts..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {recentContexts && recentContexts.length > 0 ? (
                            <div className="space-y-4">
                                {recentContexts.map((context: any) => (
                                    <GlassCard key={context.id} className="p-5 hover:border-white/20 transition-colors group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                        context.source_platform === 'chatgpt' 
                                                        ? 'bg-green-500/10 text-green-400' 
                                                        : 'bg-orange-500/10 text-orange-400'
                                                    }`}>
                                                        {context.source_platform}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {formatDistanceToNow(new Date(context.created_at))} ago
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-medium mb-2 group-hover:text-blue-400 transition-colors">
                                                    {(context.structured_context as any).summary || (context.structured_context as any).coreIntent?.slice(0, 80) || 'Untitled Context'}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {/* Intent Badge */}
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                                        (context.structured_context as any).type === 'Blueprint' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                        (context.structured_context as any).type === 'Decision' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                                        (context.structured_context as any).type === 'Task' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                                        'bg-slate-500/10 border-slate-500/30 text-slate-400'
                                                    }`}>
                                                        {(context.structured_context as any).type || 'INBOX'}
                                                    </span>

                                                    {/* Priority Badge */}
                                                    {(context.structured_context as any).priority === 'High' && (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 border border-red-500/30 text-red-400">
                                                            PRIORITY
                                                        </span>
                                                    )}

                                                    {/* Entities / Stack */}
                                                    {(context.structured_context as any).entities?.stack?.map((tech: string, i: number) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-300">
                                                            {tech}
                                                        </span>
                                                    ))}

                                                    {/* Entities / Projects */}
                                                    {(context.structured_context as any).entities?.projects?.map((project: string, i: number) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-500/5 rounded border border-blue-500/10 text-blue-300">
                                                            @{project}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <GlassButton size="sm" variant="secondary" className="p-2 h-9 w-9">
                                                    <ArrowRightLeft className="w-4 h-4" />
                                                </GlassButton>
                                                {context.slug && (
                                                    <Link href={`/c/${context.slug}`} target="_blank">
                                                        <GlassButton size="sm" variant="secondary" className="p-2 h-9 w-9 text-blue-400">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                                        </GlassButton>
                                                    </Link>
                                                )}
                                                {context.original_url && (
                                                    <a href={context.original_url} target="_blank" rel="noreferrer">
                                                        <GlassButton size="sm" variant="secondary" className="p-2 h-9 w-9">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </GlassButton>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : (
                            <GlassCard className="p-12 text-center border-dashed border-white/10 bg-transparent">
                                <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-300">No contexts captured yet</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                                    Use the Chrome Extension to extract conversation context from ChatGPT or Claude.
                                </p>
                            </GlassCard>
                        )}
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                Tips for V1
                            </h3>
                            <ul className="space-y-4 text-sm text-slate-300">
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                                    Pin the extension for one-click access.
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                                    Export from ChatGPT, then open Claude to import instantly.
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
                                    The 5-part structure is optimized for context windows.
                                </li>
                            </ul>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold mb-4">Export Destinations</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-sm font-medium">ChatGPT</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/20">CONNECTED</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-sm font-medium">Claude</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/20">CONNECTED</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 opacity-50">
                                    <span className="text-sm font-medium">Gemini</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-slate-400 rounded">COMING SOON</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 opacity-50">
                                    <span className="text-sm font-medium">Notion</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-slate-400 rounded">CONFIGURING</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
