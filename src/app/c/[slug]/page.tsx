import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Brain, Zap, Clock, ExternalLink, Repeat2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PublicContextPageProps {
    params: {
        slug: string;
    };
}

export default async function PublicContextPage({ params }: PublicContextPageProps) {
    const { slug } = params;
    
    // We use the Service Role key here to securely fetch the shared blueprint
    // without exposing the entire contexts table to public RLS queries.
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: context, error } = await supabaseAdmin
        .from('contexts')
        .select('id, slug, structured_context, created_at, original_url')
        .eq('slug', slug)
        .single();

    if (error || !context) {
        notFound();
    }

    const sc = context.structured_context as any;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-blue-500/30 overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 backdrop-blur-sm">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-blue-300 uppercase tracking-widest">Shared Cognitive Blueprint</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                        {sc.summary || sc.coreIntent?.slice(0, 80)}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(context.created_at))} ago
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-amber-400" />
                            {sc.type || 'Note'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <GlassCard className="p-8 border-white/5">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Core Intent</h3>
                        <p className="text-lg leading-relaxed text-slate-200">
                            {sc.coreIntent}
                        </p>
                    </GlassCard>

                    <div className="space-y-8">
                        <GlassCard className="p-6 border-white/5 bg-white/2">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {sc.entities?.stack?.map((tech: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                                        {tech}
                                    </span>
                                ))}
                                {(!sc.entities?.stack || sc.entities.stack.length === 0) && (
                                    <span className="text-slate-600 italic text-sm">No tech stack detected</span>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 border-white/5 bg-white/2">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Priority</h3>
                            <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold border ${
                                sc.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                sc.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}>
                                {sc.priority || 'Low'}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold px-2">Thought Architecture</h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <GlassCard className="p-6 border-white/5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Key Facts</h4>
                            <ul className="space-y-2">
                                {sc.keyFacts?.map((fact: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>

                        <GlassCard className="p-6 border-white/5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Decisions Made</h4>
                            <ul className="space-y-2">
                                {sc.decisions?.map((decision: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                                        {decision}
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <GlassCard className="p-8 border-blue-500/20 bg-blue-500/5">
                        <h3 className="text-xl font-bold mb-4">Want to transmit this thought?</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Import this cognitive architecture into your own AI session to continue the conversation exactly where it left off.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <GlassButton className="flex items-center gap-2">
                                <Repeat2 className="w-4 h-4" />
                                Import to My AI
                            </GlassButton>
                            {context.original_url && (
                                <a href={context.original_url} target="_blank" rel="noreferrer">
                                    <GlassButton variant="secondary" className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        View Original
                                    </GlassButton>
                                </a>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </main>

            <footer className="container mx-auto px-6 py-12 border-t border-white/10 text-center relative z-10">
                <p className="text-slate-500 text-sm">
                    Generated by Metaphor IO — Universal Protocol for Idea Transmission.
                </p>
            </footer>
        </div>
    );
}
