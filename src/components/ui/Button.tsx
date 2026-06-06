'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

// Omit the drag event props that conflict with framer-motion's pan handlers
type SafeButtonProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onAnimationStart'
>;

interface ButtonProps extends SafeButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    ...props
}, ref) => {

    const variants = {
        primary: "bg-white text-black hover:bg-zinc-200 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]",
        secondary: "bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800",
        ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2 aspect-square"
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </motion.button>
    );
});

Button.displayName = "Button";
export { Button };
