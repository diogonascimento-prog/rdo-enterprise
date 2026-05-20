"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ChevronRight, ShieldCheck, BarChart2, FileText } from "lucide-react";
import { LogoEngetecnica } from "@/components/shared/LogoEngetecnica";

const USUARIOS_DEMO = [
  { nome: "Gestor de Portfólio",    email: "admin@engetecnica.com.br",      initials: "GP", color: "#E8500D" },
  { nome: "Engenheiro / Aprovador", email: "engenheiro@engetecnica.com.br", initials: "EA", color: "#7C3AED" },
  { nome: "Mestre de Obra",         email: "mestre@engetecnica.com.br",     initials: "MO", color: "#16A34A" },
];

const FEATURES = [
  { icon: BarChart2, text: "Dashboards com Curva S e histogramas" },
  { icon: FileText,  text: "Relatórios diários com assinatura digital" },
  { icon: ShieldCheck, text: "Controle de SMS e ocorrências" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [senha, setSenha]       = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro]         = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErro("");
    const res = await signIn("credentials", { email, password: senha, redirect: false });
    if (res?.error) { setErro("E-mail ou senha inválidos."); setLoading(false); return; }
    router.push("/obras");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F6FA" }}>

      {/* ── Painel esquerdo — Branding ─────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[520px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0A0A0A 0%, #141414 50%, #0F0F0F 100%)" }}>

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }} />

        {/* Orange glow */}
        <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(232,80,13,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: "radial-gradient(circle at 100% 100%, rgba(232,80,13,0.08) 0%, transparent 60%)" }} />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        {/* Logo */}
        <div className="relative z-10">
          <LogoEngetecnica variant="white" />
        </div>

        {/* Hero */}
        <div className="space-y-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ background: "rgba(232,80,13,0.12)", border: "1px solid rgba(232,80,13,0.25)", color: "#F97316" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Sistema Enterprise de Gestão de Obras
            </div>

            <h1 className="text-[42px] font-black text-white leading-[1.08] tracking-tight">
              Relatório<br />
              Diário de<br />
              <span style={{
                background: "linear-gradient(135deg, #E8500D, #F97316, #FBBF24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Obra</span>
            </h1>
          </div>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(232,80,13,0.12)", border: "1px solid rgba(232,80,13,0.15)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: "#F97316" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { valor: "100%", desc: "Gratuito" },
              { valor: "7+",   desc: "Níveis de acesso" },
              { valor: "∞",    desc: "Obras & RDOs" },
            ].map(({ valor, desc }) => (
              <div key={desc} className="rounded-xl p-3.5 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xl font-black" style={{
                  background: "linear-gradient(135deg,#E8500D,#F97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>{valor}</p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs relative z-10 font-medium" style={{ color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} ENGETECNICA — Todos os direitos reservados
        </p>
      </div>

      {/* ── Painel direito — Form ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <LogoEngetecnica />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">Bem-vindo de volta</h2>
            <p className="text-slate-400 text-sm mt-1.5">Acesse o sistema de gestão de obras</p>
          </div>

          {/* Quick access */}
          <div className="rounded-2xl p-4 mb-6"
            style={{ background: "white", border: "1px solid rgba(232,80,13,0.10)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              ⚡ Acesso rápido — Validação
            </p>
            <div className="space-y-1">
              {USUARIOS_DEMO.map((u) => (
                <button key={u.email} type="button"
                  onClick={() => { setEmail(u.email); setSenha("123456"); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 group hover:bg-slate-50"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ background: u.color }}>
                    {u.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{u.nome}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-orange transition-colors shrink-0" />
                </button>
              ))}
            </div>
            <div className="mt-3 pt-2.5 text-center" style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
              <p className="text-[11px] text-slate-400">
                Senha:{" "}
                <code className="font-mono font-bold px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "#FFF7F4", color: "#E8500D", border: "1px solid rgba(232,80,13,0.12)" }}>
                  123456
                </code>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail corporativo</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="seu@engetecnica.com.br" required />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={verSenha ? "text" : "password"} value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="input pr-11" placeholder="••••••••" required />
                <button type="button" onClick={() => setVerSenha(!verSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="text-sm px-4 py-3 rounded-xl flex items-center gap-2"
                style={{ background: "#FFF0F0", border: "1px solid #FECACA", color: "#DC2626" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #E8500D 0%, #F26522 100%)",
                boxShadow: "0 4px 16px rgba(232,80,13,0.30), 0 1px 4px rgba(232,80,13,0.15)",
              }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #C44008 0%, #E8500D 100%)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { if (!loading) { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #E8500D 0%, #F26522 100%)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Entrando…" : "Entrar no sistema"}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-300 mt-8">
            Acesso restrito a colaboradores ENGETECNICA
          </p>
        </div>
      </div>
    </div>
  );
}
