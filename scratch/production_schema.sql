-- Metaphor IO - Production Schema & Security Hardening
-- Run this entire script in your Supabase SQL Editor

-- ==========================================
-- PHASE 1: CORE SCHEMA
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contexts table (stores extracted conversation contexts)
CREATE TABLE IF NOT EXISTS public.contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL CHECK (source_platform IN ('chatgpt', 'claude')),
  structured_context JSONB NOT NULL,
  original_url TEXT,
  raw_content TEXT,
  slug TEXT UNIQUE DEFAULT lower(substring(md5(random()::text), 1, 8)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_context_structure CHECK (
    structured_context ? 'coreIntent' AND
    structured_context ? 'summary' AND
    structured_context ? 'type' AND
    structured_context ? 'priority' AND
    structured_context ? 'entities' AND
    structured_context ? 'keyFacts' AND
    structured_context ? 'decisions' AND
    structured_context ? 'openQuestions' AND
    structured_context ? 'toneConstraints'
  )
);

-- Transfers table (tracks context transfer operations)
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  context_id UUID NOT NULL REFERENCES public.contexts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL CHECK (source_platform IN ('chatgpt', 'claude')),
  target_platform TEXT NOT NULL CHECK (target_platform IN ('chatgpt', 'claude')),
  transfer_time_ms INTEGER,
  manual_fixes_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_contexts_user_id ON public.contexts(user_id);
CREATE INDEX idx_contexts_created_at ON public.contexts(created_at DESC);
CREATE INDEX idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX idx_transfers_context_id ON public.transfers(context_id);
CREATE INDEX idx_transfers_created_at ON public.transfers(created_at DESC);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.users IS 'User accounts extending Supabase auth.users';
COMMENT ON TABLE public.contexts IS 'Extracted and structured AI conversation contexts';
COMMENT ON TABLE public.transfers IS 'Context transfer events between AI platforms';


-- ==========================================
-- PHASE 2: SECURITY HARDENING (RLS)
-- ==========================================

-- 1. Enable Row Level Security (RLS) on all core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- 2. Users Table Policies
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 3. Contexts Table Policies
CREATE POLICY "Users can view own contexts" 
ON public.contexts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contexts" 
ON public.contexts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contexts" 
ON public.contexts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contexts" 
ON public.contexts FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Transfers Table Policies
CREATE POLICY "Users can view own transfers" 
ON public.transfers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transfers" 
ON public.transfers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

COMMIT;
