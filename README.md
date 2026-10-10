# STCK Company

Plataforma SaaS para lojistas criarem uma vitrine virtual e receberem pedidos organizados pelo WhatsApp, com Pix Copia e Cola gerado automaticamente.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase (Auth + Postgres).

## Funcionalidades

- **Landing page** com planos e cadastro.
- **Cadastro/Login de lojistas** via Supabase Auth: a loja e o perfil são criados automaticamente no banco.
- **Painel do lojista** (`#/admin`): produtos (cadastro, edição, foto, estoque), pedidos (status, detalhes, aviso ao cliente no WhatsApp), cupons de desconto, relatórios (faturamento, ticket médio, estoque baixo, mais vendidos), fábrica de roteiros com teleprompter e configurações (WhatsApp, chave Pix, frete, cor).
- **Vitrine pública** (`#/loja/<id-da-loja>`): busca, categorias, favoritos, avaliações reais, carrinho com quantidades, cupom, frete, checkout pelo WhatsApp, Pix Copia e Cola com o valor do pedido e rastreio por código.
- **Super Admin** (`#/admin-global`): lista todas as lojas, MRR, bloqueio/liberação e troca de plano.

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev
```

### Banco de dados (obrigatório)

1. No painel do Supabase, abra **SQL Editor** e execute todo o arquivo [`supabase/schema.sql`](supabase/schema.sql).
   Ele é idempotente: cria as tabelas/colunas que faltarem, as políticas de segurança (RLS), o trigger que cria a loja no cadastro e a função pública de rastreio.
2. (Opcional) Em **Authentication → Providers → Email**, desative "Confirm email" se quiser que o lojista entre no painel logo após o cadastro.
3. Para tornar seu usuário Super Admin, rode o `update` comentado no final do `schema.sql` com o seu e-mail.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos do TypeScript |
