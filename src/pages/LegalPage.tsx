import { Logo } from '../components/Logo';

// Modelo de documentos legais. Antes de lançar, revise com um advogado e
// preencha os dados da empresa (razão social, CNPJ e e-mail de contato).
const COMPANY = 'STCK Company';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'contato@stck.company';
const UPDATED_AT = '10/10/2026';

interface Section {
  title: string;
  paragraphs: string[];
}

const TERMS: Section[] = [
  {
    title: '1. O que é a plataforma',
    paragraphs: [
      `A ${COMPANY} oferece uma ferramenta para lojistas criarem uma vitrine virtual, receberem pedidos pelo WhatsApp e gerarem códigos Pix. A ${COMPANY} não vende os produtos exibidos nas vitrines: cada loja é responsável pelos seus produtos, preços, entregas, trocas e atendimento.`,
    ],
  },
  {
    title: '2. Conta do lojista',
    paragraphs: [
      'Para usar o painel é preciso criar uma conta com e-mail e senha. Você é responsável por manter a senha em segredo e por todas as ações feitas na sua conta.',
      'As informações da loja (nome, WhatsApp, chave Pix, endereço de retirada e valores de frete) devem ser verdadeiras e atualizadas.',
    ],
  },
  {
    title: '3. Pagamentos das vendas',
    paragraphs: [
      `Os pagamentos dos clientes são feitos diretamente à loja, pela chave Pix ou pelos meios combinados no WhatsApp. A ${COMPANY} não recebe, intermedia nem guarda valores das vendas e não cobra taxa por venda.`,
      'O código Pix é gerado a partir da chave cadastrada pelo lojista. Confira sempre se a chave está correta.',
    ],
  },
  {
    title: '4. Assinatura',
    paragraphs: [
      'O uso do painel pode depender de um plano pago, conforme os valores divulgados no site. Se a assinatura não estiver em dia, o acesso ao painel e a vitrine podem ser suspensos até a regularização.',
    ],
  },
  {
    title: '5. Uso proibido',
    paragraphs: [
      'É proibido usar a plataforma para vender produtos ilegais, falsificados ou que violem direitos de terceiros, para enganar consumidores ou para enviar mensagens não solicitadas em massa. Lojas que descumprirem estas regras podem ser bloqueadas sem aviso prévio.',
    ],
  },
  {
    title: '6. Responsabilidades',
    paragraphs: [
      'O lojista é o único responsável pela relação com seus clientes, incluindo o cumprimento do Código de Defesa do Consumidor (prazo de entrega, direito de arrependimento, trocas e garantia) e a emissão de documentos fiscais.',
      `A ${COMPANY} se esforça para manter o serviço disponível, mas não garante funcionamento ininterrupto e não se responsabiliza por perdas decorrentes de indisponibilidade de serviços de terceiros (internet, WhatsApp, bancos, Correios).`,
    ],
  },
  {
    title: '7. Alterações e contato',
    paragraphs: [
      `Estes termos podem ser atualizados. A versão vigente fica sempre nesta página. Dúvidas: ${CONTACT_EMAIL}.`,
    ],
  },
];

const PRIVACY: Section[] = [
  {
    title: '1. Quem somos',
    paragraphs: [
      `Esta política explica como a ${COMPANY} trata dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).`,
      `Para os dados dos lojistas, a ${COMPANY} é a controladora. Para os dados dos clientes que compram nas vitrines, cada loja é a controladora e a ${COMPANY} atua como operadora, tratando os dados apenas para viabilizar o pedido.`,
    ],
  },
  {
    title: '2. Dados que coletamos',
    paragraphs: [
      'Lojistas: e-mail, senha (armazenada de forma criptografada), dados da loja, produtos, pedidos e configurações.',
      'Clientes das vitrines: nome, WhatsApp, endereço de entrega (incluindo CEP), itens do pedido e, se o cliente quiser, nome e comentário em avaliações públicas de produtos.',
    ],
  },
  {
    title: '3. Para que usamos',
    paragraphs: [
      'Para criar e manter a conta do lojista, exibir a vitrine, registrar pedidos, enviar o pedido ao WhatsApp da loja, calcular frete e gerar o código Pix.',
      'Não vendemos dados pessoais e não os usamos para publicidade de terceiros.',
    ],
  },
  {
    title: '4. Com quem compartilhamos',
    paragraphs: [
      'Com a loja onde o pedido foi feito. Com provedores necessários ao funcionamento do serviço: hospedagem e banco de dados (Supabase e Vercel) e consulta de CEP (ViaCEP, que recebe apenas o CEP digitado). Ao finalizar o pedido, a mensagem é enviada pelo WhatsApp, que tem a própria política de privacidade.',
    ],
  },
  {
    title: '5. Dados salvos no seu navegador',
    paragraphs: [
      'Para facilitar novas compras, a vitrine guarda no seu próprio navegador o carrinho, os favoritos e os dados de entrega preenchidos. Você pode apagá-los limpando os dados do site no navegador.',
    ],
  },
  {
    title: '6. Por quanto tempo guardamos',
    paragraphs: [
      'Os dados da conta e dos pedidos ficam guardados enquanto a loja estiver ativa ou pelo prazo exigido por lei. Ao encerrar a conta, os dados da loja são excluídos, salvo obrigações legais de guarda.',
    ],
  },
  {
    title: '7. Seus direitos',
    paragraphs: [
      `Você pode pedir acesso, correção, anonimização ou exclusão dos seus dados, além de informações sobre o compartilhamento. Clientes de uma loja podem falar diretamente com a loja ou com a ${COMPANY} pelo e-mail ${CONTACT_EMAIL}.`,
    ],
  },
  {
    title: '8. Segurança',
    paragraphs: [
      'Usamos conexões criptografadas (HTTPS), senhas criptografadas e regras de acesso no banco de dados para que cada lojista veja apenas os dados da própria loja.',
    ],
  },
];

export default function LegalPage({ kind }: { kind: 'terms' | 'privacy' }) {
  const isTerms = kind === 'terms';
  const sections = isTerms ? TERMS : PRIVACY;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo />
          <a href="#/" className="text-sm text-ink-muted hover:text-ink">← Voltar ao site</a>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">{isTerms ? 'Termos de Uso' : 'Política de Privacidade'}</h1>
        <p className="mt-2 text-sm text-ink-soft">Última atualização: {UPDATED_AT}</p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-semibold">{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 text-[15px] text-ink-muted leading-relaxed">{p}</p>
              ))}
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-ink-soft">
          Veja também: {isTerms ? <a href="#/privacidade" className="text-brand-700 hover:underline">Política de Privacidade</a> : <a href="#/termos" className="text-brand-700 hover:underline">Termos de Uso</a>}
        </p>
      </main>
    </div>
  );
}
