export default function Home() {
  const crons = [
    { hora: "08:00", nome: "Descoberta de Repositórios", tipo: "repos", status: "agendado" },
    { hora: "08:30", nome: "TikTok — Pesquisa Pesada", tipo: "tiktok", status: "agendado" },
    { hora: "09:00", nome: "TikTok — Validação Crítica", tipo: "tiktok", status: "agendado" },
    { hora: "09:30", nome: "TikTok — Produção de Artefatos", tipo: "tiktok", status: "agendado" },
    { hora: "12:00", nome: "Gmail Inbox Zero", tipo: "gmail", status: "agendado" },
    { hora: "17:00", nome: "TikTok — Síntese + Feedback", tipo: "tiktok", status: "agendado" },
    { hora: "17:30", nome: "Oportunidades de Mercado", tipo: "oportunidades", status: "agendado" },
    { hora: "18:00", nome: "Descoberta de Repositórios #2", tipo: "repos", status: "agendado" },
    { hora: "18:30", nome: "Revisão Geral Diária", tipo: "revisao", status: "agendado" },
  ];

  const crostipo = [
    { label: "repos", color: "bg-sky-500" },
    { label: "tiktok", color: "bg-fuchsia-500" },
    { label: "gmail", color: "bg-rose-500" },
    { label: "oportunidades", color: "bg-amber-500" },
    { label: "revisao", color: "bg-emerald-500" },
  ];

  const plan = {
    total: 10,
    current: 1,
    completed: 0,
    days: [
      { d: 1, label: "FastMoss + Marketplace + Nicho" },
      { d: 2, label: "Ferramentas vídeo/áudio + 1º vídeo" },
      { d: 3, label: "TokPortal + Criar conta TikTok" },
      { d: 4, label: "10 roteiros + 10 vídeos" },
      { d: 5, label: "Lançamento (primeiras postagens)" },
      { d: 6, label: "Análise + Variações" },
      { d: 7, label: "Escala + 2º nicho" },
      { d: 8, label: "Pipeline n8n" },
      { d: 9, label: "Teste automático + 2ª conta" },
      { d: 10, label: "Playbook + Decisão" },
    ],
  };

  const ferramentas = [
    { nome: "FastMoss", categoria: "Pesquisa", url: "fastmoss.com", destaque: false },
    { nome: "Riffkit", categoria: "Vídeo", url: "riffkit.ai", destaque: false },
    { nome: "Creatify", categoria: "Vídeo", url: "creatify.ai", destaque: false },
    { nome: "ElevenLabs", categoria: "Áudio", url: "elevenlabs.io", destaque: false },
    { nome: "TokPortal", categoria: "Automação", url: "tokportal.com", destaque: true },
    { nome: "n8n", categoria: "Automação", url: "n8n.io", destaque: false },
    { nome: "Sisif.ai", categoria: "Vídeo", url: "sisif.ai", destaque: false },
    { nome: "VEO3", categoria: "Vídeo", url: "deepmind.google", destaque: false },
    { nome: "Euka AI", categoria: "Gestão", url: "euka.ai", destaque: false },
    { nome: "Zie619/n8n-workflows", categoria: "Workflows", url: "github.com/Zie619/n8n-workflows", destaque: true },
  ];

  const repos = [
    { nome: "open-multi-agent", stars: "6.5k", url: "github.com/open-multi-agent/open-multi-agent", lang: "TS" },
    { nome: "Scrapling", stars: "66.3k", url: "github.com/D4Vinci/Scrapling", lang: "Python" },
    { nome: "WordPress MCP", stars: "oficial", url: "github.com/WordPress/mcp-adapter", lang: "PHP" },
    { nome: "jobsync", stars: "cresc.", url: "github.com/Gsync/jobsync", lang: "TS" },
    { nome: "oh-my-openagent", stars: "—", url: "github.com/code-yeongyu/oh-my-openagent", lang: "TS" },
    { nome: "n8n-workflows", stars: "4.3k", url: "github.com/Zie619/n8n-workflows", lang: "Python" },
  ];

  const ideias = [
    "#1 Repositórios", "#2 Projetos rentáveis", "#3 n8n-workflows",
    "#4 oh-my-openagent", "#5 Hotmail", "#6 Word formatter",
    "#7 Job Hunter", "#8 Viagens WhatsApp", "#9 Mashup OS",
    "#10 Office AI", "#11 Personal Trainer AI", "#12 Designer Sites",
    "#13 WP/Elementor", "#14 Segurança Sites", "#15 Roteamento Modelos",
  ];

  const pct = Math.round((plan.completed / plan.total) * 100);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚀</span>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PIPO Ecosystem</h1>
            <p className="text-sm text-zinc-500 font-mono">Dashboard do Ecossistema — 14 Jul 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-400">9 crons ativos</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Grade + Progresso */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grade de Hoje */}
          <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Grade de Hoje</h2>
            <div className="space-y-2">
              {crons.map((c) => (
                <div key={c.hora} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-right font-mono text-zinc-500">{c.hora}</span>
                  <span className={`w-2 h-2 rounded-full ${c.status === "rodando" ? "bg-green-500 animate-pulse" : "bg-zinc-700"}`} />
                  <span className="flex-1 text-zinc-300">{c.nome}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                    c.tipo === "repos" ? "bg-sky-500/20 text-sky-400" :
                    c.tipo === "tiktok" ? "bg-fuchsia-500/20 text-fuchsia-400" :
                    c.tipo === "gmail" ? "bg-rose-500/20 text-rose-400" :
                    c.tipo === "oportunidades" ? "bg-amber-500/20 text-amber-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {c.tipo}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Progresso TikTok Shop */}
          <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">TikTok Shop — Progresso</h2>
              <span className="text-xs font-mono text-zinc-500">{pct}% completo</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {plan.days.map((d) => (
                <div key={d.d} className={`text-center py-2 px-1 rounded-lg text-[11px] font-mono leading-tight ${
                  d.d === plan.current ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50" :
                  d.d <= plan.completed ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-zinc-800/50 text-zinc-600"
                }`}>
                  <div className="font-bold mb-0.5">D{d.d}</div>
                  <div className="truncate">{d.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>Dia atual: <strong className="text-white">{plan.current}</strong></span>
              <span>Concluídos: <strong className="text-emerald-400">{plan.completed}</strong></span>
              <span>Restantes: <strong className="text-cyan-400">{plan.total - plan.completed}</strong></span>
            </div>
          </section>
        </div>

        {/* Coluna 2: Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Status do Sistema</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Projeto TikTok</span><span className="text-emerald-400">🟢 Ativo</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Plano de Estudos</span><span className="text-cyan-400">10 dias</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Crons Ativos</span><span className="text-white font-mono">9</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Repositórios no Vault</span><span className="text-white font-mono">6</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Ideias Mapeadas</span><span className="text-white font-mono">15</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Confiança no Modelo</span><span className="text-amber-400">70%</span></div>
            </div>
          </section>

          {/* Ferramentas em Destaque */}
          <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Stack de Ferramentas</h2>
            <div className="space-y-2">
              {ferramentas.filter(f => f.destaque).map((f) => (
                <div key={f.nome} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <span className="text-amber-400 text-xs">🆕</span>
                  <span className="text-sm text-zinc-200 font-medium">{f.nome}</span>
                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">{f.categoria}</span>
                </div>
              ))}
              {ferramentas.filter(f => !f.destaque).map((f) => (
                <div key={f.nome} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-xs text-zinc-600">•</span>
                  <span className="text-sm text-zinc-400">{f.nome}</span>
                  <span className="text-[10px] text-zinc-600 font-mono ml-auto">{f.categoria}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Linha 2: Descobertas + Ideias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Repositórios Descobertos */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">📦 Repositórios no Vault</h2>
          <div className="space-y-2">
            {repos.map((r) => (
              <div key={r.nome} className="flex items-center gap-3 text-sm py-1.5">
                <span className="w-16 text-[10px] font-mono text-zinc-600 bg-zinc-800/50 rounded px-1.5 py-0.5 text-center">{r.lang}</span>
                <span className="flex-1 text-zinc-300 font-medium truncate">{r.nome}</span>
                <span className="text-xs text-zinc-600 font-mono">{r.stars} ⭐</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ideias */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">💡 Ideias no Radar</h2>
          <div className="flex flex-wrap gap-1.5">
            {ideias.map((i) => (
              <span key={i} className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-700/50">
                {i}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
        <span>PIPO Dashboard v0.1 — Feito pelo Pipo para o João</span>
        <span className="font-mono">UTC-3 · 14 Jul 2026</span>
      </footer>
    </div>
  );
}
