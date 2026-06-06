"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import {
  Zap, CheckCircle2, User, Briefcase, Target, Brain,
  ChevronRight, Code2, Layers, Building2, ArrowRight,
  Terminal, Eye, EyeOff
} from "lucide-react";

// ─── Simulated SDK call ───────────────────────────────────────────────────────
// In a real integration, this would be: 
// import MetaphorClient from "@metaphor-io/sdk";
// const client = new MetaphorClient({ apiKey: "mtphr_..." });
// const result = await client.getProfile();
// ──────────────────────────────────────────────────────────────────────────────

const DEMO_PROFILE = {
  name: "Default Profile",
  version: 3,
  layers: {
    identity: {
      name: "Alex Rivera",
      role: "Founder & CEO",
      organization: "Helix AI",
      bio: "Building context-aware infrastructure for the AI era. Previously at DeepMind.",
    },
    mission: {
      goals: ["Ship MVP by Q3", "Close seed round", "Onboard first 3 enterprise customers"],
      currentProject: "Metaphor IO integration",
      successCriteria: "Users arrive at every platform already understood.",
    },
    projects: {
      activeItems: ["SDK v1.0 release", "Investor deck", "Developer portal"],
      priorities: ["API stability", "Documentation", "Demo recording"],
      timeline: "6 weeks to launch",
    },
    preferences: {
      communicationStyle: "Direct and dense — skip pleasantries",
      tone: "Thoughtful, technical, slightly contrarian",
      format: "Bullet points for status, prose for strategy",
    },
    memory: {
      keyFacts: ["Using Convex as backend", "Targeting developers first, then enterprises", "Rejected VC term with board control clause"],
      decisions: ["Went with platform SDK over Chrome extension as primary surface", "Building in public from day 1"],
      staticGuidelines: "Never build Layer 2 (UI) before Layer 1 (infrastructure) is stable.",
    },
    org: {
      companyContext: "Helix AI is a 3-person team building context infrastructure for the AI era.",
      brandVoice: "Infrastructure-first, not product-first. Dense, technical, no hype.",
    },
  },
};

type Step = "landing" | "connecting" | "fetching" | "done";

export default function DemoPage() {
  const [step, setStep] = useState<Step>("landing");
  const [apiKey, setApiKey] = useState("mtphr_a1b2c3d4e5f6...");
  const [showKey, setShowKey] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const runDemo = async () => {
    setStep("connecting");
    await delay(800);
    setStep("fetching");
    await delay(1400);
    setStep("done");
  };

  const reset = () => setStep("landing");

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-300 uppercase tracking-widest">
              Live Integration Demo
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            You are{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              already known.
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
            This is what it looks like when a platform integrates the Metaphor IO SDK.
            No onboarding. No form. Just instant context.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left — Platform POV */}
          <div className="space-y-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform's View</p>

            {/* API Key input */}
            <GlassCard className="p-5 border-white/5">
              <p className="text-xs text-slate-500 mb-3 font-medium">Configured API Key</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-3">
                <code className="text-sm text-emerald-400 flex-1 font-mono">
                  {showKey ? apiKey : "mtphr_••••••••••••••••••"}
                </code>
                <button onClick={() => setShowKey(!showKey)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </GlassCard>

            {/* Integration Code */}
            <GlassCard className="p-5 border-white/5">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setShowCode(!showCode)}
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Integration Code</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${showCode ? "rotate-90" : ""}`} />
              </button>

              <AnimatePresence>
                {showCode && (
                  <motion.pre
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <code className="text-xs text-slate-300 leading-relaxed block bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto">
{`import MetaphorClient from "@metaphor-io/sdk";

const client = new MetaphorClient({ 
  apiKey: process.env.METAPHOR_API_KEY 
});

// Called when user signs up or logs in
const result = await client.getProfile({ 
  hint: "project" 
});

const { profile } = result.data;

// You now know: who they are, what they're
// building, their preferences, and their org —
// before they type a single character.
console.log(profile.layers.identity.name);
// → "Alex Rivera"`}
                    </code>
                  </motion.pre>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* CTA */}
            <div className="flex gap-4">
              {step === "done" ? (
                <GlassButton variant="secondary" onClick={reset} className="flex-1 justify-center">
                  Reset Demo
                </GlassButton>
              ) : (
                <GlassButton
                  onClick={runDemo}
                  loading={step === "connecting" || step === "fetching"}
                  className="flex-1 justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {step === "landing" && "Run Integration"}
                  {step === "connecting" && "Connecting…"}
                  {step === "fetching" && "Fetching Profile…"}
                </GlassButton>
              )}
            </div>

            {/* Status Log */}
            <GlassCard className="p-4 border-white/5 bg-black/30 font-mono text-xs space-y-1.5">
              <StatusLine done={step !== "landing"} active={step === "connecting"} text="→ Authenticating API Key…" />
              <StatusLine done={["fetching", "done"].includes(step)} active={step === "fetching"} text="→ Fetching active profile…" />
              <StatusLine done={step === "done"} active={false} text="→ Context loaded. User recognised." />
            </GlassCard>
          </div>

          {/* Right — What the platform now knows */}
          <div className="space-y-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">What the Platform Now Knows</p>

            <AnimatePresence>
              {step === "done" ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Identity */}
                  <ProfileCard
                    icon={<User className="w-4 h-4 text-blue-400" />}
                    title="Identity"
                    color="blue"
                    delay={0}
                  >
                    <p className="text-white font-semibold">{DEMO_PROFILE.layers.identity.name}</p>
                    <p className="text-slate-400 text-sm">{DEMO_PROFILE.layers.identity.role} · {DEMO_PROFILE.layers.identity.organization}</p>
                    <p className="text-slate-500 text-xs mt-1">{DEMO_PROFILE.layers.identity.bio}</p>
                  </ProfileCard>

                  {/* Mission */}
                  <ProfileCard
                    icon={<Target className="w-4 h-4 text-purple-400" />}
                    title="Mission"
                    color="purple"
                    delay={0.1}
                  >
                    <p className="text-slate-300 text-sm font-medium mb-2">{DEMO_PROFILE.layers.mission.currentProject}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DEMO_PROFILE.layers.mission.goals.map((g, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg">
                          {g}
                        </span>
                      ))}
                    </div>
                  </ProfileCard>

                  {/* Preferences */}
                  <ProfileCard
                    icon={<Brain className="w-4 h-4 text-amber-400" />}
                    title="Preferences"
                    color="amber"
                    delay={0.2}
                  >
                    <p className="text-slate-400 text-sm">{DEMO_PROFILE.layers.preferences.communicationStyle}</p>
                    <p className="text-slate-500 text-xs mt-1">Tone: {DEMO_PROFILE.layers.preferences.tone}</p>
                  </ProfileCard>

                  {/* Org */}
                  <ProfileCard
                    icon={<Building2 className="w-4 h-4 text-emerald-400" />}
                    title="Org Context"
                    color="emerald"
                    delay={0.3}
                  >
                    <p className="text-slate-400 text-sm">{DEMO_PROFILE.layers.org.companyContext}</p>
                    <p className="text-slate-500 text-xs mt-1 italic">"{DEMO_PROFILE.layers.org.brandVoice}"</p>
                  </ProfileCard>

                  {/* Bottom Banner */}
                  <GlassCard className="p-4 border-blue-500/20 bg-blue-500/5 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">Zero onboarding. Full context.</p>
                      <p className="text-xs text-slate-400">Alex arrived already known. No forms filled.</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <GlassCard className="p-16 text-center border-dashed border-white/5 bg-transparent">
                  <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/5 mx-auto mb-4 flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-slate-700" />
                  </div>
                  <p className="text-slate-600 text-sm">Profile loads here after integration.</p>
                  <p className="text-slate-700 text-xs mt-1">No form. No onboarding. Just context.</p>
                </GlassCard>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-16 text-center">
          <a href="/dashboard/developers" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Get your API Key from the Developer Portal <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function StatusLine({ done, active, text }: { done: boolean; active: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 transition-colors ${done ? "text-emerald-400" : active ? "text-blue-400 animate-pulse" : "text-slate-700"}`}>
      {done ? (
        <CheckCircle2 className="w-3 h-3 shrink-0" />
      ) : (
        <div className={`w-3 h-3 shrink-0 rounded-full border ${active ? "border-blue-400 animate-ping" : "border-slate-700"}`} />
      )}
      {text}
    </div>
  );
}

function ProfileCard({ icon, title, color, delay: d, children }: {
  icon: React.ReactNode;
  title: string;
  color: "blue" | "purple" | "amber" | "emerald";
  delay: number;
  children: React.ReactNode;
}) {
  const borderMap = {
    blue: "border-blue-500/20",
    purple: "border-purple-500/20",
    amber: "border-amber-500/20",
    emerald: "border-emerald-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: d }}
    >
      <GlassCard className={`p-5 ${borderMap[color]}`}>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
        </div>
        {children}
      </GlassCard>
    </motion.div>
  );
}
