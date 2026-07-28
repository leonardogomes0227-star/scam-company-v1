import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezbhiyzcdkszeazzhsyn.supabase.co'
const supabaseKey = 'cole_a_sua_chave_real_aqui_entre_as_aspas' 

export const supabase = createClient(supabaseUrl, supabaseKey)
