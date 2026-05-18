'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    icon?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, error, label, icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-zinc-300 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-200",
                            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                            "hover:border-zinc-700",
                            icon && "pl-10",
                            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 ml-1"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

GlassInput.displayName = "GlassInput";
