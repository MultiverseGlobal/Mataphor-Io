'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function Card({ children, className, hoverEffect = false }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                "bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm",
                hoverEffect && "hover:bg-zinc-900/60 hover:border-white/10 transition-colors duration-300",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
