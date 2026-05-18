"use client"

import Link from "next/link"

export default function PoliticaDePrivacidade() {
  return (
    <main className="min-h-dvh" style={{ background: "#000" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid var(--glass-border)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-black text-white tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm"
            style={{ fontSize: "1.1rem", letterSpacing: "-0.03em" }}
          >
            unoduno
          </Link>
          <Link
            href="/"
            className="text-sm font-medium transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-12">
          <h1
            className="font-black text-white mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Política de Privacidade
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Última atualização: 13 de maio de 2026
          </p>
        </header>

        <div className="space-y-10" style={{ color: "var(--text-light)" }}>
          {/* Introdução */}
          <section>
            <p className="text-sm leading-relaxed">
              A Unoduno (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Empresa&quot;) respeita sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza nossa plataforma.
            </p>
          </section>

          {/* 1. Dados Coletados */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              1. Dados que Coletamos
            </h2>
            
            <h3 className="text-base font-semibold text-white mb-3">1.1 Dados fornecidos por você</h3>
            <ul className="text-sm leading-relaxed space-y-2 ml-4 mb-6">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Dados de cadastro:</strong> nome, e-mail, senha criptografada
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Dados de pagamento:</strong> processados por terceiros (Stripe), não armazenamos dados de cartão
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Conteúdo enviado:</strong> URLs de vídeos e roteiros gerados
              </li>
            </ul>

            <h3 className="text-base font-semibold text-white mb-3">1.2 Dados coletados automaticamente</h3>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Dados de uso:</strong> páginas visitadas, funcionalidades utilizadas, tempo de sessão
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional, dispositivo
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Cookies e tecnologias similares:</strong> identificadores de sessão e preferências
              </li>
            </ul>
          </section>

          {/* 2. Uso dos Dados */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              2. Como Usamos seus Dados
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Utilizamos seus dados pessoais para:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Fornecer, operar e manter nossos serviços
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Processar transações e enviar informações relacionadas
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Comunicar atualizações, promoções e novidades (com seu consentimento)
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Melhorar e personalizar sua experiência
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Detectar e prevenir fraudes e abusos
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Cumprir obrigações legais e regulatórias
              </li>
            </ul>
          </section>

          {/* 3. Compartilhamento */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              3. Compartilhamento de Dados
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Não vendemos seus dados pessoais. Podemos compartilhá-los apenas com:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Provedores de serviços:</strong> processadores de pagamento, serviços de hospedagem, ferramentas de analytics
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Parceiros de IA:</strong> para processamento de conteúdo (dados anonimizados quando possível)
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Autoridades legais:</strong> quando exigido por lei ou ordem judicial
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Sucessores comerciais:</strong> em caso de fusão, aquisição ou venda de ativos
              </li>
            </ul>
          </section>

          {/* 4. Cookies */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              4. Cookies e Tecnologias de Rastreamento
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            
            <div className="space-y-4 ml-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Cookies Essenciais</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Necessários para o funcionamento do site. Não podem ser desativados.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Cookies de Performance</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Coletam dados anônimos sobre como você usa o site (Vercel Analytics).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Cookies de Funcionalidade</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Lembram suas preferências e configurações.
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mt-4">
              Você pode gerenciar cookies através das configurações do seu navegador. Note que desativar certos cookies pode afetar a funcionalidade do site.
            </p>
          </section>

          {/* 5. Segurança */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              5. Segurança dos Dados
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Criptografia SSL/TLS em todas as transmissões
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Senhas armazenadas com hash bcrypt
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Acesso restrito a dados pessoais (princípio do mínimo privilégio)
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Monitoramento contínuo de vulnerabilidades
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Backups regulares em servidores seguros
              </li>
            </ul>
          </section>

          {/* 6. Retenção */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              6. Retenção de Dados
            </h2>
            <p className="text-sm leading-relaxed">
              Mantemos seus dados pessoais enquanto sua conta estiver ativa ou conforme necessário para fornecer nossos serviços. Após o encerramento da conta, podemos reter dados por até 5 anos para cumprir obrigações legais, resolver disputas e fazer cumprir nossos acordos.
            </p>
          </section>

          {/* 7. Direitos */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              7. Seus Direitos (LGPD)
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Confirmação e acesso:</strong> saber se tratamos seus dados e acessar cópia deles
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Correção:</strong> solicitar a correção de dados incompletos ou incorretos
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Anonimização ou exclusão:</strong> solicitar a anonimização ou exclusão de dados desnecessários
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Portabilidade:</strong> receber seus dados em formato estruturado
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Revogação do consentimento:</strong> retirar seu consentimento a qualquer momento
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                <strong className="text-white">Oposição:</strong> opor-se ao tratamento de dados
              </li>
            </ul>
            <p className="text-sm leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato através do e-mail{" "}
              <a href="mailto:privacidade@unoduno.com" className="underline transition-colors duration-200 hover:text-white">
                privacidade@unoduno.com
              </a>
              .
            </p>
          </section>

          {/* 8. Menores */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              8. Menores de Idade
            </h2>
            <p className="text-sm leading-relaxed">
              Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se você acredita que um menor nos forneceu dados pessoais, entre em contato conosco imediatamente.
            </p>
          </section>

          {/* 9. Transferência Internacional */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              9. Transferência Internacional de Dados
            </h2>
            <p className="text-sm leading-relaxed">
              Seus dados podem ser transferidos e processados em servidores localizados fora do Brasil. Quando isso ocorre, garantimos que os países de destino oferecem nível de proteção adequado ou implementamos salvaguardas contratuais apropriadas.
            </p>
          </section>

          {/* 10. Alterações */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              10. Alterações nesta Política
            </h2>
            <p className="text-sm leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre disponível nesta página com a data da última atualização. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma.
            </p>
          </section>

          {/* 11. Contato */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              11. Contato e Encarregado de Dados (DPO)
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Para questões sobre esta Política ou sobre o tratamento de seus dados pessoais:
            </p>
            <div className="text-sm leading-relaxed space-y-2">
              <p>
                <strong className="text-white">E-mail geral:</strong>{" "}
                <a href="mailto:oi@unoduno.com" className="underline transition-colors duration-200 hover:text-white">
                  oi@unoduno.com
                </a>
              </p>
              <p>
                <strong className="text-white">E-mail do DPO:</strong>{" "}
                <a href="mailto:privacidade@unoduno.com" className="underline transition-colors duration-200 hover:text-white">
                  privacidade@unoduno.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--glass-border)" }} className="px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium leading-4" style={{ color: "var(--text-subtle)" }}>
            &copy; 2026 Unoduno — Todos os direitos reservados
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/termos"
              className="text-xs font-medium transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm leading-4"
              style={{ color: "var(--text-subtle)" }}
            >
              Termos de Uso
            </Link>
            <a
              href="mailto:oi@unoduno.com"
              className="text-xs font-medium transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm leading-4"
              style={{ color: "var(--text-subtle)" }}
            >
              oi@unoduno.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
