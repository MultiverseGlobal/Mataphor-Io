'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Repeat2, Brain, Fingerprint, Sparkles, Share2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-blue-500/30 overflow-hidden">

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-50 container mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="font-bold text-white">M</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Metaphor IO
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/auth" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <Link href="/auth">
                        <GlassButton size="sm" variant="secondary" className="rounded-full">
                            Get Started
                        </GlassButton>
                    </Link>
                </div>
            </nav >

            {/* Hero Section */}
            <header className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-slate-300">V1.0 is now live</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Stop explaining yourself <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse-slow">
                            to your AI.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Transfer conversation context instantly between ChatGPT and Claude.
                        Preserve your intent, decisions, and constraints in one click.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/auth">
                            <GlassButton size="lg" className="pl-8 pr-8 text-lg group">
                                Start Transferring
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </GlassButton>
                        </Link>
                        <a href="#demo" className="text-slate-400 hover:text-white transition-colors font-medium">
                            See how it works
                        </a>
                    </div>
                </motion.div>

                {/* Hero Visual/Demo Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-20 relative max-w-5xl mx-auto"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl -z-10" />
                    <GlassCard className="border-slate-800 bg-slate-900/80 p-1">
                        <div className="rounded-xl bg-[#0F1115] overflow-hidden border border-slate-800 aspect-[16/9] relative grid grid-cols-2">
                            {/* Left: ChatGPT */}
                            <div className="p-6 border-r border-slate-800 flex flex-col">
                                <div className="flex items-center gap-2 mb-6 opacity-50">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <div className="space-y-4 font-mono text-xs">
                                    <div className="bg-slate-800/50 p-3 rounded-lg w-3/4 self-end text-slate-300">
                                        I need a React component for a glass button...
                                    </div>
                                    <div className="bg-green-900/20 p-3 rounded-lg w-3/4 text-green-400">
                                        Here's a refined version using Framer Motion...
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
                                        className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 z-10"
                                    >
                                        <div className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-blue-500 transition-colors">
                                            <Zap className="w-4 h-4" /> Extract Context
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Right: Claude */}
                            <div className="p-6 bg-[#13151A] flex flex-col">
                                <div className="flex items-center justify-end gap-2 mb-6 opacity-50">
                                    <span className="text-[10px] text-slate-500">CLAUDE.AI</span>
                                </div>
                                <div className="space-y-4 font-mono text-xs mt-auto">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2, repeat: Infinity, repeatDelay: 3 }}
                                        className="bg-purple-900/20 p-3 rounded-lg w-full text-purple-300 border border-purple-500/20"
                                    >
                                        <span className="text-purple-400 font-bold block mb-1">SYSTEM PROMPT APPLIED:</span>
                                        Context: Glass Button Component
                                        <br />
                                        Constraint: Use Tailwind + Framer Motion
                                        <br />
                                        Intent: Refine hover states
                                    </motion.div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg w-3/4 text-slate-300">
                                        Great context. Let's add the hover effect...
                                    </div>
                                </div>
                            </div>

                            {/* Arrow Animation */}
                            <motion.div
                                animate={{ x: [0, 50, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                            >
                                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-[2px]" />
                            </motion.div>
                        </div>
                    </GlassCard>
                </motion.div>
            </header >

            {/* Features Grid (Bento Style) */}
            <section className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="md:col-span-2 p-8 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6">
                            <Brain className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Universal Thought Schema</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Metaphor IO isn't just a bridge; it's a protocol. We convert your raw AI sessions into a stable, 
                            interoperable <strong>Cognitive Blueprint</strong> that preserves the internal architecture 
                            of your ideas across any platform.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-8 bg-white/5">
                        <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6">
                            <Repeat2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Inter-AI Transmission</h3>
                        <p className="text-slate-400 text-sm">
                            The "USB standard" for AI. Export from ChatGPT, import to Claude, 
                            and continue without losing a single decision or constraint.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-8 bg-white/5">
                        <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-6">
                            <Share2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Notion Sync</h3>
                        <p className="text-slate-400 text-sm">
                            Turn conversations into documentation. Automatically sync your "Blueprints" 
                            to your Notion Workspace with intelligent classification.
                        </p>
                    </GlassCard>

                    <GlassCard className="md:col-span-2 p-8 bg-gradient-to-bl from-purple-500/10 to-transparent border-purple-500/20">
                        <div className="h-12 w-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-6">
                            <Fingerprint className="w-6 h-6 text-pink-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Reality-to-Reality</h3>
                        <p className="text-slate-400 leading-relaxed">
                            The context travels with <strong>you</strong>. Whether you're switching apps, 
                            onboarding a new hire, or presenting to a client, your cognitive architecture 
                            is always ready to transmit.
                        </p>
                    </GlassCard>
                </div>
            </section >

            {/* CTA Section */}
            <section className="container mx-auto px-6 py-24 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-[100px] opacity-20 -z-10" />
                    <h2 className="text-4xl font-bold mb-8">Ready to accelerate your workflow?</h2>
                    <Link href="/auth">
                        <GlassButton size="lg" className="mx-auto pl-10 pr-10">
                            Get Started for Free
                        </GlassButton>
                    </Link>
                </div>
            </section >

            {/* Footer */}
            <footer className="container mx-auto px-6 py-12 border-t border-white/10 text-center">
                <p className="text-slate-500 text-sm">
                    &copy; 2025 Metaphor IO. Built for the future of thought.
                </p>
            </footer >
        </div >
    );
}
