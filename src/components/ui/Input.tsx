'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, icon, ...props }, ref) => {
        return (
            <div className="w-full relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-200",
                        "focus:border-zinc-600 focus:bg-zinc-900 focus:ring-1 focus:ring-zinc-700",
                        icon && "pl-9",
                        error && "border-red-900/50 focus:border-red-500/50",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-[10px] text-red-500 mt-1 block px-1">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export { Input };
