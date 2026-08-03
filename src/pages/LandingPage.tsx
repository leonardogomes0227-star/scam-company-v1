import React, { useEffect, useRef } from 'react';

export default function Landing() {
  const waBodyRef = useRef<HTMLDivElement>(null);
  const originalHtmlRef = useRef<string>("");

  useEffect(() => {
    // Animação cíclica do WhatsApp
    if (waBodyRef.current && !originalHtmlRef.current) {
      originalHtmlRef.current = waBodyRef.current.innerHTML;
    }

    const interval = setInterval(() => {
      if (waBodyRef.current) {
        waBodyRef.current.style.opacity = '0';
        setTimeout(() => {
          if (waBodyRef.current) {
            waBodyRef.current.innerHTML = originalHtmlRef.current;
            waBodyRef.current.style.opacity = '1';
          }
        }, 400);
      }
    }, 7000);

    // Intersection Observer para animar os cards de recursos aparecendo
    const feats = document.querySelectorAll('.feat');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in-view'), i * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    feats.forEach(f => observer.observe(f));

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="glow"></div>

      <header>
        <div className="logo">
          <div className="logo-mark">S</div>
          <div>
            <div className="logo-text">STCK COMPANY</div>
            <div className="logo-sub">The World Is Yours</div>
          </div>
        </div>
        <nav>
          <a href="#recursos">Recursos</a>
          <a href="#precos">Preços</a>
          <a href="#">Fazer login</a>
          <a href="#" className="btn-primary">Criar loja grátis</a>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div>
            <div className="eyebrow reveal r1">Roteiros e teleprompter integrados</div>
            <h1 className="reveal r2">Sua loja vende<br />sozinha no <span className="hl">WhatsApp</span></h1>
            <p className="lead reveal r3">Cadastre seus produtos, envie seu link exclusivo e receba pedidos organizados direto no chat — com Pix gerado na hora e roteiros prontos pra gravar com teleprompter embutido.</p>
            <div className="cta-row reveal r4">
              <a href="#precos" className="btn-lg">Criar minha loja agora →</a>
              <a href="#recursos" className="btn-ghost">Ver recursos</a>
            </div>
            <div className="proof reveal r5">
              <span><strong>+2.400</strong> lojas criadas</span>
              <span>·</span>
              <span>Pix gerado automaticamente em cada pedido</span>
            </div>
          </div>

          <div className="phone-wrap reveal r2">
            <div className="phone">
              <div className="phone-notch"></div>
              <div className="wa-header">
                <div className="wa-avatar">M</div>
                <div>
                  <div className="wa-name">Loja da Marina</div>
                  <div className="wa-status">online</div>
                </div>
              </div>
              <div className="wa-body" id="waBody" ref={waBodyRef}>
                <div className="bubble in b1">Oi! Vi o vestido azul na sua loja, ainda tem tamanho M?</div>
                <div className="bubble out b2">
                  Tem sim! Separei aqui pra você<br />
                  <div style={{ height: '64px', background: 'linear-gradient(135deg,#2a2a2a,#111)', borderRadius: '6px', marginTop: '6px' }}></div>
                </div>
                <div className="bubble in b3">Perfeito, quero levar!</div>
                <div className="bubble out pix b4">
                  <div className="pix-tag">PIX GERADO</div>
                  Vestido Azul M — R$ 89,90<br />Copia e cola disponível
                </div>
                <div className="bubble in b5">Pago agora mesmo!</div>
              </div>
            </div>
          </div>
        </section>

        {/* RECURSOS */}
        <section className="section" id="recursos">
          <div className="section-head">
            <div className="eyebrow">Como funciona</div>
            <h2>Tudo que você precisa pra vender sem complicação</h2>
            <p>Do cadastro do produto ao Pix na mão do cliente — sem sair do WhatsApp.</p>
          </div>
          <div className="grid3">
            <div className="feat">
              <div className="feat-ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="7" y="2" width="10" height="20" rx="2" />
                  <line x1="11" y1="18" x2="13" y2="18" />
                </svg>
              </div>
              <h3>100% otimizado pra mobile</h3>
              <p>Seus clientes navegam, escolhem e compram direto pelo celular, com carregamento rápido.</p>
            </div>
            <div className="feat">
              <div className="feat-ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="6" width="14" height="12" rx="2" />
                  <path d="M16 10l6-3v10l-6-3" />
                </svg>
              </div>
              <h3>Roteiros e teleprompter</h3>
              <p>Gere roteiros automáticos pros seus produtos e grave vídeos direto pelo painel, sem decorar a fala.</p>
            </div>
            <div className="feat">
              <div className="feat-ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <h3>Checkout via WhatsApp</h3>
              <p>Cada pedido chega formatado e organizado direto no chat da sua loja, com Pix já gerado.</p>
            </div>
          </div>
        </section>

        {/* PREÇOS */}
        <section className="section" id="precos">
          <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 50px' }}>
            <div className="eyebrow" style={{ margin: '0 auto 16px' }}>Planos Transparentes</div>
            <h2>Comece a vender mais hoje mesmo</h2>
            <p>Escolha o plano ideal para o tamanho do seu negócio e acelere suas vendas no WhatsApp.</p>
          </div>

          <div className="pricing-grid">
            <div className="price-card">
              <div className="plan-name">Iniciante</div>
              <div className="plan-desc">Ideal para quem está começando a estruturar as vendas online.</div>
              <div className="plan-price">R$ 49<span>/mês</span></div>
              <ul className="plan-features">
                <li>✓ Até 100 produtos cadastrados</li>
                <li>✓ Link exclusivo da loja</li>
                <li>✓ Geração automática de Pix</li>
                <li>✓ Suporte via chat</li>
              </ul>
              <a href="#" className="btn-ghost" style={{ display: 'block', textAlign: 'center', marginTop: '24px' }}>Escolher Iniciante</a>
            </div>

            <div className="price-card popular">
              <div className="popular-badge">Mais Popular</div>
              <div className="plan-name">Profissional</div>
              <div className="plan-desc">Para quem quer escala, roteiros automáticos e teleprompter.</div>
              <div className="plan-price">R$ 97<span>/mês</span></div>
              <ul className="plan-features">
                <li>✓ Produtos ilimitados</li>
                <li>✓ Roteiros e teleprompter integrados</li>
                <li>✓ Checkout avançado via WhatsApp</li>
                <li>✓ Prioridade no suporte</li>
                <li>✓ Sem taxa por venda</li>
              </ul>
              <a href="#" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '24px' }}>Criar Loja Pro Agora</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="section-head">
            <div className="eyebrow">Dúvidas Frequentes</div>
            <h2>Tudo o que você precisa saber</h2>
            <p>Tire suas dúvidas sobre como a STCK Company funciona na prática.</p>
          </div>

          <div className="faq-list">
            <div className="faq-item">
              <h3>Como recebo o dinheiro das minhas vendas?</h3>
              <p>O pagamento via Pix vai direto para a sua conta bancária cadastrada, sem intermediários e sem taxas ocultas por transação.</p>
            </div>
            <div className="faq-item">
              <h3>Preciso ter conhecimento técnico para montar a loja?</h3>
              <p>Zero! O painel foi desenvolvido para ser extremamente simples. Em menos de 5 minutos você cadastra seus produtos e já pode divulgar o link.</p>
            </div>
            <div className="faq-item">
              <h3>Como funcionam os roteiros e o teleprompter?</h3>
              <p>Nossa inteligência ajuda a estruturar o texto ideal para o seu produto. O teleprompter roda direto na tela para você gravar vídeos fluidos para o Instagram, TikTok e Status sem travar.</p>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="section">
          <div className="cta-bottom">
            <h2>Pronto para vender no automático?</h2>
            <p>Junte-se a milhares de lojistas que simplificaram os pedidos e pagamentos no WhatsApp.</p>
            <a href="#precos" className="btn-lg" style={{ position: 'relative', zIndex: 1 }}>
              Criar minha loja grátis agora →
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div>© 2026 STCK Company</div>
        <div>Feito pra quem vende todo dia no WhatsApp</div>
      </footer>
    </>
  );
}
