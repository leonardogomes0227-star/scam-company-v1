-- Atualização: personalização completa da vitrine (tema, banner, seções, horário,
-- formas de pagamento, frete por bairro) e produtos em destaque. Pode rodar mais de uma vez.
alter table public.tenants  add column if not exists custom   jsonb default '{}'::jsonb;
alter table public.products add column if not exists featured boolean default false;

-- Recarrega o cache de colunas da API
notify pgrst, 'reload schema';
