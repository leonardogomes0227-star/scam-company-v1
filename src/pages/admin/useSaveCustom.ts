import { useCallback, useState } from 'react';
import { MIGRATION_HINT, writeWithFallback } from '../../lib/db';
import { normalizeCustom, type StoreCustom } from '../../lib/custom';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../components/Toast';
import type { StoreData } from './useStoreData';

/** Salva `custom` (e campos soltos da loja) mesclando com o que já está salvo. */
export function useSaveCustom(data: StoreData, tenantId: string) {
  const toast = useToast();
  const { setTenant } = data;
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (custom: StoreCustom, extra: Record<string, unknown> = {}, okMessage = 'Salvo! Sua vitrine já está atualizada.') => {
      const patch = { ...extra, custom };
      setSaving(true);
      const { error, degraded } = await writeWithFallback((d) => supabase.from('tenants').update(d).eq('id', tenantId), patch, ['custom']);
      setSaving(false);
      if (error) {
        toast('Erro ao salvar: ' + error.message, true);
        return false;
      }
      setTenant((t) => (t ? { ...t, ...(degraded ? extra : patch) } : t));
      toast(degraded ? MIGRATION_HINT : okMessage, degraded);
      return !degraded;
    },
    [tenantId, setTenant, toast],
  );

  return { save, saving };
}

export { normalizeCustom };
