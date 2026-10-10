import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Executa uma escrita e, se o banco ainda não tiver as colunas novas
 * (SQL de atualização não rodado), tenta de novo sem elas.
 * `degraded` indica que os campos opcionais não foram salvos.
 */
export async function writeWithFallback<T extends Record<string, unknown>>(
  write: (payload: Partial<T>) => PromiseLike<{ error: PostgrestError | null }>,
  payload: T,
  optionalKeys: (keyof T)[],
): Promise<{ error: PostgrestError | null; degraded: boolean }> {
  const first = await write(payload);
  if (!first.error) return { error: null, degraded: false };
  const missingColumn = /column|schema cache/i.test(first.error.message);
  if (!missingColumn) return { error: first.error, degraded: false };
  const reduced = { ...payload };
  for (const k of optionalKeys) delete reduced[k];
  const second = await write(reduced);
  return { error: second.error, degraded: !second.error };
}

export const MIGRATION_HINT = 'Alguns campos novos não foram salvos: rode o SQL de atualização no Supabase (supabase/schema.sql).';
