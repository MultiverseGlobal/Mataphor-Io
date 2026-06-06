'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    LogOut,
    ArrowRightLeft
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';
// import { TransferAccordion } from '@/components/sidebar/TransferAccordion';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuthActions();
    const [sourceAI, setSourceAI] = useState('ChatGPT');
    const [destAI, setDestAI] = useState('Claude');

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <aside className="w-80 h-screen bg-black border-r border-zinc-900 fixed left-0 top-0 z-40 flex flex-col font-sans">

            {/* Brand Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-900 bg-black/50 backdrop-blur-xl z-20">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        <span className="font-bold text-black text-[10px]">M</span>
                    </div>
                    <span className="font-semibold text-zinc-100 tracking-tight text-sm">Metaphor</span>
                </div>
                <Link href="/dashboard" className="text-zinc-600 hover:text-white transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                </Link>
            </div>

            {/* AI Switcher Panel (Sticky Top) */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950/30 backdrop-blur-md z-10">
                <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                    {/* Source */}
                    <div className="relative flex-1 min-w-0">
                        <select
                            value={sourceAI}
                            onChange={(e) => setSourceAI(e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 bg-transparent text-xs text-zinc-300 font-medium appearance-none focus:outline-none cursor-pointer hover:text-white transition-colors"
                        >
                            <option>ChatGPT</option>
                            <option>Claude</option>
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    </div>

                    <div className="text-zinc-600">
                        <ArrowRightLeft className="w-3 h-3" />
                    </div>

                    {/* Dest */}
                    <div className="relative flex-1 min-w-0">
                        <select
                            value={destAI}
                            onChange={(e) => setDestAI(e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 bg-transparent text-xs text-zinc-300 font-medium appearance-none focus:outline-none cursor-pointer hover:text-white transition-colors"
                        >
                            <option>Claude</option>
                            <option>ChatGPT</option>
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 pointer-events-none shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                    </div>
                </div>
            </div>

            {/* Accordion Workflow */}
            {/* <TransferAccordion /> */}

            {/* Footer / User */}
            <div className="p-3 border-t border-zinc-900 bg-black mt-auto">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] text-zinc-600 font-medium px-2 font-mono">V1.0.4</div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 hover:bg-white/5 rounded"
                    >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
