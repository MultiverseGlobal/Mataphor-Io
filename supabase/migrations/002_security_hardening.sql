-- Metaphor IO - Security Hardening Migration
-- Enables RLS and sets strict owner-only access policies

-- 1. Enable Row Level Security (RLS) on all core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- 2. Users Table Policies
-- Allow users to see their own profile
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 3. Contexts Table Policies
-- Allow users to view their own contexts
CREATE POLICY "Users can view own contexts" 
ON public.contexts FOR SELECT 
USING (auth.uid() = user_id);
-- NOTE: In a strictly private environment, we'd limit what columns are returned.
-- For V1, the slug is the access key.

-- Allow users to insert their own contexts
CREATE POLICY "Users can insert own contexts" 
ON public.contexts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own contexts
CREATE POLICY "Users can update own contexts" 
ON public.contexts FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own contexts
CREATE POLICY "Users can delete own contexts" 
ON public.contexts FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Transfers Table Policies
-- Allow users to view their own transfer history
CREATE POLICY "Users can view own transfers" 
ON public.transfers FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to record their own transfers
CREATE POLICY "Users can insert own transfers" 
ON public.transfers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Revoke direct public access to sensitive columns if needed
-- For V1, we ensure the 'raw_content' column is not leaked in the public slug policy if possible
-- But Supabase policies are usually per-row. We'll handle column-level filtering in the API.

COMMIT;
