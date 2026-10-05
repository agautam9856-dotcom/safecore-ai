import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey)

// Create the client only if keys are present to prevent crashes
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : null
