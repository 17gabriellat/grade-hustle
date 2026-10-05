import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Menggunakan URL dan Key yang Anda berikan
const supabaseUrl = 'https://uqwexqbtfgluzpsbgkgx.supabase.co'
const supabaseKey = 'sb_publishable_5p7er8ruOyYO4u5kg-7TRA_JVzaPdYY'

export const supabase = createClient(supabaseUrl, supabaseKey)
