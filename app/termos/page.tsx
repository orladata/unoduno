"use client"

import Link from "next/link"

export default function TermosDeUso() {
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
            Termos de Uso
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Última atualização: 13 de maio de 2026
          </p>
        </header>

        <div className="space-y-10" style={{ color: "var(--text-light)" }}>
          {/* 1. Aceitação */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              1. Aceitação dos Termos
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Ao acessar ou utilizar a plataforma Unoduno (&quot;Serviço&quot;), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso Serviço.
            </p>
            <p className="text-sm leading-relaxed">
              Estes termos constituem um acordo legal entre você (&quot;Usuário&quot;) e Unoduno (&quot;Empresa&quot;, &quot;nós&quot;, &quot;nosso&quot;).
            </p>
          </section>

          {/* 2. Descrição do Serviço */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              2. Descrição do Serviço
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              O Unoduno é uma plataforma de inteligência artificial que oferece:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Tradução neural de conteúdo de vídeo
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Reconhecimento de padrões virais
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Engenharia de hooks para o mercado brasileiro
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Geração de roteiros adaptados
              </li>
            </ul>
          </section>

          {/* 3. Cadastro e Conta */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              3. Cadastro e Conta
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Para utilizar o Serviço, você deverá criar uma conta fornecendo informações precisas e completas. Você é responsável por:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Manter a confidencialidade das suas credenciais de acesso
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Todas as atividades que ocorram sob sua conta
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Notificar-nos imediatamente sobre qualquer uso não autorizado
              </li>
            </ul>
          </section>

          {/* 4. Uso Aceitável */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              4. Uso Aceitável
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Você concorda em não utilizar o Serviço para:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Violar direitos autorais ou propriedade intelectual de terceiros
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Criar conteúdo ilegal, difamatório, obsceno ou prejudicial
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Interferir ou interromper o funcionamento do Serviço
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Tentar acessar áreas restritas ou sistemas não autorizados
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Revender ou redistribuir o Serviço sem autorização
              </li>
            </ul>
          </section>

          {/* 5. Propriedade Intelectual */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              5. Propriedade Intelectual
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Todo o conteúdo, tecnologia e marca do Unoduno são de propriedade exclusiva da Empresa. O Usuário mantém a propriedade do conteúdo que submete ao Serviço.
            </p>
            <p className="text-sm leading-relaxed">
              Ao utilizar o Serviço, você nos concede uma licença limitada, não exclusiva e revogável para processar seu conteúdo com o único propósito de fornecer o Serviço.
            </p>
          </section>

          {/* 6. Pagamentos e Assinatura */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              6. Pagamentos e Assinaturas
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              O Serviço é oferecido mediante assinatura mensal. Ao assinar, você concorda que:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                A cobrança será recorrente até o cancelamento
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                O cancelamento pode ser feito a qualquer momento
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Não há reembolso proporcional por períodos parciais
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Preços podem ser alterados com aviso prévio de 30 dias
              </li>
            </ul>
          </section>

          {/* 7. Limitação de Responsabilidade */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              7. Limitação de Responsabilidade
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              O Serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. Na extensão máxima permitida por lei, a Empresa não será responsável por:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Danos indiretos, incidentais ou consequenciais
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Perda de lucros, dados ou oportunidades de negócio
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "var(--text-subtle)" }}>—</span>
                Interrupções ou erros no Serviço
              </li>
            </ul>
          </section>

          {/* 8. Modificações */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              8. Modificações dos Termos
            </h2>
            <p className="text-sm leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma. O uso continuado do Serviço após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          {/* 9. Rescisão */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              9. Rescisão
            </h2>
            <p className="text-sm leading-relaxed">
              Podemos suspender ou encerrar sua conta e acesso ao Serviço, a nosso exclusivo critério, por violação destes Termos ou por qualquer outro motivo, sem aviso prévio ou responsabilidade.
            </p>
          </section>

          {/* 10. Lei Aplicável */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              10. Lei Aplicável e Foro
            </h2>
            <p className="text-sm leading-relaxed">
              Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo, SP, como competente para dirimir quaisquer controvérsias decorrentes destes Termos.
            </p>
          </section>

          {/* 11. Contato */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
              11. Contato
            </h2>
            <p className="text-sm leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <p className="text-sm leading-relaxed mt-4">
              <strong className="text-white">E-mail:</strong>{" "}
              <a
                href="mailto:oi@unoduno.com"
                className="underline transition-colors duration-200 hover:text-white"
              >
                oi@unoduno.com
              </a>
            </p>
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
              href="/privacidade"
              className="text-xs font-medium transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-sm leading-4"
              style={{ color: "var(--text-subtle)" }}
            >
              Privacidade
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
