import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezbhiyzcdkszeazzhsyn.supabase.co'
const supabaseKey = 'sb_secret_UBEmEDok45OoWTxitXMXMw_saF3VKOt'
export const supabase = createClient(supabaseUrl, supabaseKey)
