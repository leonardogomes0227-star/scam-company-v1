# STCK Company

Plataforma SaaS para lojistas criarem uma vitrine virtual e receberem pedidos organizados pelo WhatsApp, com Pix Copia e Cola gerado automaticamente.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase (Auth + Postgres).

## Funcionalidades

- **Site (landing page):** apresentação completa com como funciona, recursos, demonstração da vitrine, planos, FAQ e chamada final.
- **Cadastro e login** de lojistas via Supabase Auth: a loja e o perfil são criados automaticamente no banco.
- **Vitrine pública** (`#/loja/<id-da-loja>`):
  - tema com a cor da marca de cada loja, banner, busca, categorias e ordenação;
  - página do produto com avaliações reais, produtos relacionados e quantidade;
  - carrinho em gaveta, cupom, checkout em etapas (dados → frete → pagamento);
  - **venda na cidade e para todo o Brasil:** o cliente informa o CEP (busca automática no ViaCEP) e vê só as opções que valem para ele — entrega local (centro/bairros), retirada na loja ou envio para outra cidade (valor fixo ou a combinar);
  - frete grátis acima de um valor, com barra de progresso no carrinho;
  - produtos com tamanhos/cores e preço promocional ("de/por");
  - pedido enviado pelo WhatsApp + **Pix Copia e Cola** com o valor exato;
  - rastreio do pedido com barra de progresso, favoritos e botão flutuante do WhatsApp.
- **Painel do lojista** (`#/admin`), com menu lateral no computador e barra inferior no celular:
  - **Visão geral:** link da loja para divulgar, checklist de configuração, KPIs, gráfico de faturamento dos últimos 14 dias, pedidos recentes e estoque baixo;
  - **Pedidos:** abas por status, busca, detalhes, mensagem pronta para o cliente no WhatsApp e **baixa automática de estoque** ao confirmar o pagamento;
  - **Produtos:** busca e filtros, cadastro/edição com foto, duplicar, ajuste rápido de estoque;
  - **Cupons:** criação com sugestões e contagem de uso;
  - **Marketing:** roteiros de vídeo com teleprompter (velocidade, fonte, espelhamento) e texto pronto para status/grupos;
  - **Configurações:** identidade, cor da marca, WhatsApp, chave Pix e frete, com pré-visualização ao vivo.
- **Super Admin** (`#/admin-global`): lojas da plataforma, MRR, bloqueio/liberação, troca de plano e exclusão.

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev
```

### Banco de dados (obrigatório)

1. No painel do Supabase, abra **SQL Editor** e execute todo o arquivo [`supabase/schema.sql`](supabase/schema.sql).
   Se o banco já existia, basta rodar as atualizações em [`supabase/migrations/`](supabase/migrations).
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
