'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { 
    Settings, 
    Key, 
    Share2, 
    Database, 
    CheckCircle2, 
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState({
        openai_key: '',
        notion_token: '',
        notion_inbox_id: '',
        notion_tasks_id: '',
        auto_sync: false
    });

    useEffect(() => {
        // Load settings from profile/settings table in V2
        // For now we use local storage or placeholder
    }, []);

    const handleSave = async () => {
        setLoading(true);
        // Simulate save
        await new Promise(r => setTimeout(r, 800));
        setSaved(true);
        setLoading(false);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <Settings className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold">Infrastructure Settings</h1>
                </div>

                <div className="space-y-8">
                    {/* Intelligence Layer */}
                    <GlassCard className="p-8 border-white/5">
                        <div className="flex items-center gap-2 mb-6">
                            <Key className="w-5 h-5 text-amber-400" />
                            <h2 className="text-xl font-bold">Intelligence Layer</h2>
                        </div>
                        <p className="text-sm text-slate-400 mb-6">
                            Connect your OpenAI account to enable deep intent classification and high-fidelity cognitive packaging.
                        </p>
                        <GlassInput 
                            label="OpenAI API Key"
                            type="password"
                            placeholder="sk-..."
                            value={settings.openai_key}
                            onChange={(e) => setSettings({...settings, openai_key: e.target.value})}
                        />
                    </GlassCard>

                    {/* Notion Integration */}
                    <GlassCard className="p-8 border-white/5">
                        <div className="flex items-center gap-2 mb-6">
                            <Share2 className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold">Notion Connection</h2>
                        </div>
                        <div className="space-y-6">
                            <GlassInput 
                                label="Internal Integration Token"
                                type="password"
                                placeholder="secret_..."
                                value={settings.notion_token}
                                onChange={(e) => setSettings({...settings, notion_token: e.target.value})}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <GlassInput 
                                    label="Inbox Database ID"
                                    placeholder="856..."
                                    value={settings.notion_inbox_id}
                                    onChange={(e) => setSettings({...settings, notion_inbox_id: e.target.value})}
                                />
                                <GlassInput 
                                    label="Tasks Database ID"
                                    placeholder="f32..."
                                    value={settings.notion_tasks_id}
                                    onChange={(e) => setSettings({...settings, notion_tasks_id: e.target.value})}
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Protocol Settings */}
                    <GlassCard className="p-8 border-white/5">
                        <div className="flex items-center gap-2 mb-6">
                            <Database className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-xl font-bold">Protocol Defaults</h2>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                            <div>
                                <h4 className="font-medium">Automatic Sync</h4>
                                <p className="text-xs text-slate-500">Automatically push all exported contexts to Notion Inbox.</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, auto_sync: !settings.auto_sync})}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.auto_sync ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.auto_sync ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </GlassCard>

                    <div className="flex items-center justify-end gap-4">
                        {saved && (
                            <span className="text-emerald-400 text-sm flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Settings saved successfully
                            </span>
                        )}
                        <GlassButton 
                            size="lg" 
                            className="px-10" 
                            loading={loading}
                            onClick={handleSave}
                        >
                            Save Changes
                        </GlassButton>
                    </div>
                </div>
            </main>
        </div>
    );
}
