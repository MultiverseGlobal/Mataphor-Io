# Metaphor IO - V1 MVP

**Cross-AI Context Bridge** enabling seamless conversation state transfer between ChatGPT and Claude without re-explanation.

## 🎯 Overview

Metaphor IO treats context as a portable asset, not something locked inside a single AI session. Extract conversations from one AI platform, structure them intelligently, and transfer them to another—all in under 10 seconds.

### Core Workflow: Extract → Structure → Transfer

1. **Extract**: Capture conversation context from ChatGPT or Claude
2. **Structure**: Convert to stable, 5-part model-agnostic format
3. **Transfer**: Paste into target AI and continue seamlessly

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Chrome browser (for extension)

### 1. Clone & Install

```bash
cd "c:\Users\LENOVO\Documents\Metaphor io"
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 3. Run Database Migrations

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or manually run the SQL files in your Supabase SQL Editor:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`

### 4. Start the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Install Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` directory
5. Pin the extension to your toolbar

## 📂 Project Structure

```
metaphor-io/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Dashboard & transfer UI
│   │   └── api/               # API routes
│   └── lib/                   # Core libraries
│       ├── supabase.ts        # Database client
│       ├── contextSchema.ts   # 5-part format definition
│       ├── extractor.ts       # Context extraction logic
│       └── formatter.ts       # Platform-specific formatters
├── extension/                 # Chrome extension
│   ├── manifest.json
│   ├── content/              # ChatGPT & Claude scripts
│   ├── background/           # Service worker
│   └── popup/                # Extension popup
└── supabase/
    └── migrations/           # Database schema
```

## 🎨 Features

### Web Application

- **Modern Landing Page**: Vibrant gradients, animations, clear value prop
- **Authentication**: Email/password + OAuth (Google, GitHub)
- **Dashboard**: Stats cards, context history, search
- **Transfer Interface**: 3-step wizard (extract → review → output)

### Chrome Extension

- **Export Buttons**: Injected into ChatGPT and Claude UIs
- **One-Click Extraction**: Automatic message parsing and structuring
- **Quick Import**: Popup with last context, one-click import to current tab
- **Offline Storage**: Works without internet, syncs when online

## 🧠 5-Part Context Structure

Every conversation is structured into:

1. **Core Intent**: Primary goal or question
2. **Key Facts**: Definitions, data, constraints
3. **Decisions**: Choices made during conversation
4. **Open Questions**: Unresolved items
5. **Tone Constraints**: Style, voice, assumptions

This format is:
- ✅ Model-agnostic (works across AIs)
- ✅ Human-readable (can edit before transfer)
- ✅ Versioned (schema can evolve)
- ✅ Compact (fits in context windows)

## 📊 Success Metrics

V1 targets:
- ⏱️ Transfer time: **<10 seconds** end-to-end
- ✅ Manual fixes required: **0%** (context preserves intent)
- 🔄 Repeat usage: **5+ transfers/week** per active user

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: Supabase (PostgreSQL + RLS)
- **Extension**: Chrome Manifest V3
- **Validation**: Zod schemas

## 📝 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚧 V1 Scope (What's NOT Included)

- ❌ Long-term memory or identity storage
- ❌ Reasoning, summarization, or "second brain" features
- ❌ Autonomous agents or orchestration
- ❌ Knowledge base or personal profiles
- ❌ Support for Gemini, Grok, or other AIs (ChatGPT ↔ Claude only)

## 📦 Deployment

### Vercel (Frontend)

```bash
npm run build
vercel deploy
```

Add environment variables in Vercel dashboard.

### Supabase (Database)

Already hosted! Just run migrations:
```bash
supabase db push
```

## 🧪 Testing

```bash
npm run test
```

Manual testing checklist:
1. [ ] Sign up / sign in works
2. [ ] Export context from ChatGPT
3. [ ] Context appears in dashboard
4. [ ] Transfer to Claude works
5. [ ] Imported context continues conversation seamlessly

## 📄 License

MIT

## 🤝 Contributing

V1 is scope-locked. Feature requests for V2+ welcome in issues.

---

Built for power AI users, developers, founders, and researchers who deserve better than copy-paste.
