import { createClient } from '@supabase/supabase-js';

// A chave "publishable" é pública por natureza (a segurança vem das políticas RLS
// em supabase/schema.sql). Ainda assim, prefira configurar via .env.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezbhiyzcdkszeazzhsyn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3LbKgY81Xg9lZCuoqclvjg_5zqnnvBi';

export const supabase = createClient(supabaseUrl, supabaseKey);
