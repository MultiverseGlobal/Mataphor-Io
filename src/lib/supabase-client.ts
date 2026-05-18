import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Browser client for client components
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
