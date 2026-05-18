'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={hoverEffect ? { y: -2 } : undefined}
            className={cn(
                "bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl overflow-hidden",
                hoverEffect && "hover:border-white/10 hover:bg-zinc-800/60 transition-colors",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
