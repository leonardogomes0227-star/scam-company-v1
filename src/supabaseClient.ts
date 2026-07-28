import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezbhiyzcdkszeazzhsyn.supabase.co'
const supabaseKey = 'sb_publishable_3LbKgY81gZCuoqclvjg_5zqnn...' // Cole a chave completa aqui

export const supabase = createClient(supabaseUrl, supabaseKey)
