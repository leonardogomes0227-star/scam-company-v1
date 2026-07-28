import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezbhiyzcdkszeazzhsyn.supabase.co'
const supabaseKey = 'sb_publishable_3LbKgY81Xg9lZCuoqclvjg_5zqnnvBi'

export const supabase = createClient(supabaseUrl, supabaseKey)
