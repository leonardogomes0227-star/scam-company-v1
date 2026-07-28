import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezbhiyzcdkszeazzhsyn.supabase.co'
const supabaseKey = 'SUA_PUBLISHABLE_KEY_AQUI' // Cole a chave que está no print

export const supabase = createClient(supabaseUrl, supabaseKey)
