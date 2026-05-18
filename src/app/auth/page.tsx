'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';
import { LogIn, Github, Mail, Chrome, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { motion } from 'framer-motion';

export default function AuthPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const supabase = createBrowserClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;
                setMessage('Check your email to confirm your account!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'OAuth sign-in failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0A0A0B] text-white overflow-hidden">

            {/* Left Panel - Brand Visual */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="font-bold text-white text-xl">M</span>
                        </div>
                        <h1 className="text-2xl font-bold">Metaphor IO</h1>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-medium leading-tight mb-6"
                    >
                        "The continuity of thought is the ultimate productivity hack for the AI era."
                    </motion.blockquote>
                    <div className="flex items-center gap-4 text-slate-400">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-sm uppercase tracking-widest">Bridging Intelligence</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                <div className="max-w-md w-full">
                    <GlassCard className="p-8 md:p-12 border-slate-800 bg-slate-900/50">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold mb-2">
                                {isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="text-slate-400">
                                {isSignUp
                                    ? 'Enter your details to get started'
                                    : 'Enter your credentials to access your dashboard'}
                            </p>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <GlassCard className="mb-6 p-4 bg-red-500/10 border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </GlassCard>
                        )}
                        {message && (
                            <GlassCard className="mb-6 p-4 bg-green-500/10 border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                {message}
                            </GlassCard>
                        )}

                        <div className="space-y-4 mb-8">
                            <GlassButton
                                variant="secondary"
                                onClick={() => handleOAuthSignIn('google')}
                                className="w-full justify-center"
                            >
                                <Chrome className="w-5 h-5" />
                                Continue with Google
                            </GlassButton>
                            <GlassButton
                                variant="secondary"
                                onClick={() => handleOAuthSignIn('github')}
                                className="w-full justify-center"
                            >
                                <Github className="w-5 h-5" />
                                Continue with GitHub
                            </GlassButton>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-4 bg-[#0F1115] text-slate-500 backdrop-blur-xl">Or continue with</span>
                            </div>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-6">
                            <GlassInput
                                label="Email"
                                type="email"
                                placeholder="hello@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={<Mail className="w-4 h-4" />}
                            />

                            <div className="space-y-2">
                                <GlassInput
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    icon={<LogIn className="w-4 h-4" />}
                                />
                                {!isSignUp && (
                                    <div className="flex justify-end">
                                        <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot password?</a>
                                    </div>
                                )}
                            </div>

                            <GlassButton
                                type="submit"
                                loading={loading}
                                className="w-full justify-center"
                                size="lg"
                            >
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </GlassButton>
                        </form>

                        <div className="mt-8 text-center text-sm text-slate-400">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setMessage('');
                                }}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
