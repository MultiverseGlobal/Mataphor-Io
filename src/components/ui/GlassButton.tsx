'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export function GlassButton({
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    ...props
}: GlassButtonProps) {

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border border-blue-500/50",
        secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700",
        ghost: "bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white border border-transparent",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3 text-base"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled || loading}
            className={cn(
                "relative flex items-center justify-center gap-2 font-medium rounded-lg transition-all",
                variants[variant],
                sizes[size],
                (disabled || loading) && "opacity-50 cursor-not-allowed",
                className
            )}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </motion.button>
    );
}
