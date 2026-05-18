// Auto-generated database types - placeholder
// Generate actual types by running: npx supabase gen types typescript --local

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            contexts: {
                Row: {
                    id: string
                    user_id: string
                    source_platform: 'chatgpt' | 'claude'
                    structured_context: Json
                    original_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    source_platform: 'chatgpt' | 'claude'
                    structured_context: Json
                    original_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    source_platform?: 'chatgpt' | 'claude'
                    structured_context?: Json
                    original_url?: string | null
                    created_at?: string
                }
            }
            transfers: {
                Row: {
                    id: string
                    context_id: string
                    user_id: string
                    source_platform: 'chatgpt' | 'claude'
                    target_platform: 'chatgpt' | 'claude'
                    transfer_time_ms: number | null
                    manual_fixes_required: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    context_id: string
                    user_id: string
                    source_platform: 'chatgpt' | 'claude'
                    target_platform: 'chatgpt' | 'claude'
                    transfer_time_ms?: number | null
                    manual_fixes_required?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    context_id?: string
                    user_id?: string
                    source_platform?: 'chatgpt' | 'claude'
                    target_platform?: 'chatgpt' | 'claude'
                    transfer_time_ms?: number | null
                    manual_fixes_required?: boolean
                    created_at?: string
                }
            }
        }
    }
}
