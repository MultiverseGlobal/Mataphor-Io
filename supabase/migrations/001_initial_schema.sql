-- Metaphor IO - Initial Schema
-- Creates core tables: users, contexts, transfers

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
COMMENT ON COLUMN public.contexts.structured_context IS 'JSONB containing 5-part format: coreIntent, keyFacts, decisions, openQuestions, toneConstraints';
COMMENT ON COLUMN public.transfers.transfer_time_ms IS 'Time taken for full transfer flow in milliseconds (success metric: <10000ms)';
COMMENT ON COLUMN public.transfers.manual_fixes_required IS 'Whether user had to manually edit context after transfer (success metric: false)';
