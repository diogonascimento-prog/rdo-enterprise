"use client";
import { useState, useTransition } from "react";
import { User, Lock, Info, CheckCircle, AlertCircle, Database, Server, Tag } from "lucide-react";
import { atualizarPerfil, trocarSenha } from "@/actions/perfil";

interface Props {
  usuario: { id: string; nome: string; email: string; cargo: string | null; registro: string | null; telefone: string | null; role: string } | null;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador", GESTOR_PORTFOLIO: "Gestor de Portfólio", ENGENHEIRO: "Engenheiro",
  APROVADOR: "Aprovador", MESTRE_OBRA: "Mestre de Obra", ELABORADOR: "Elaborador", VISUALIZADOR: "Visualizador",
};

export function ConfiguracoesClient({ usuario }: Props) {
  const [aba, setAba] = useState<"perfil" | "senha" | "sistema">("perfil");
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function feedback(tipo: "ok" | "erro", texto: string) {
    setMsg({ tipo, texto });
    if (tipo === "ok") setTimeout(() => setMsg(null), 4000);
  }

  async function handlePerfil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await atualizarPerfil(new FormData(e.currentTarget));
        feedback("ok", "Perfil atualizado com sucesso!");
      } catch (err: any) { feedback("erro", err.message); }
    });
  }

  async function handleSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      try {
        await trocarSenha(new FormData(form));
        feedback("ok", "Senha alterada com sucesso!");
        form.reset();
      } catch (err: any) { feedback("erro", err.message); }
    });
  }

  const abas = [
    { id: "perfil" as const, label: "Meu Perfil", icon: User },
    { id: "senha"  as const, label: "Alterar Senha", icon: Lock },
    { id: "sistema" as const, label: "Sistema", icon: Info },
  ];

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 rounded-full bg-orange-gradient" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistema</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-400 mt-1">Gerencie seu perfil e preferências do sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.04)", width: "fit-content" }}>
        {abas.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setAba(id); setMsg(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={aba === id
              ? { background: "white", color: "#0F172A", boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }
              : { color: "#64748B" }}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {msg && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: msg.tipo === "ok" ? "#F0FDF4" : "#FFF0F0", border: `1px solid ${msg.tipo === "ok" ? "#BBF7D0" : "#FECACA"}`, color: msg.tipo === "ok" ? "#16A34A" : "#DC2626" }}>
          {msg.tipo === "ok" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.texto}
        </div>
      )}

      {/* ABA: PERFIL */}
      {aba === "perfil" && (
        <div className="card p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#E8500D,#F97316)" }}>
              {usuario?.nome?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg">{usuario?.nome}</p>
              <p className="text-sm text-slate-400">{usuario?.email}</p>
              <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#FFF7F4", color: "#E8500D", border: "1px solid rgba(232,80,13,0.15)" }}>
                {ROLE_LABEL[usuario?.role ?? ""] ?? usuario?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handlePerfil} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Nome completo *</label>
                <input name="nome" required defaultValue={usuario?.nome ?? ""} className="input" />
              </div>
              <div>
                <label className="label">Cargo</label>
                <input name="cargo" defaultValue={usuario?.cargo ?? ""} className="input" placeholder="Ex: Engenheiro Civil" />
              </div>
              <div>
                <label className="label">Registro profissional</label>
                <input name="registro" defaultValue={usuario?.registro ?? ""} className="input" placeholder="Ex: CREA-SP 123456" />
              </div>
              <div className="col-span-2">
                <label className="label">Telefone</label>
                <input name="telefone" defaultValue={usuario?.telefone ?? ""} className="input" placeholder="(11) 99999-9999" />
              </div>
            </div>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
              {pending ? "Salvando…" : "Salvar perfil"}
            </button>
          </form>
        </div>
      )}

      {/* ABA: SENHA */}
      {aba === "senha" && (
        <div className="card p-6 max-w-md">
          <h2 className="font-bold text-slate-800 mb-5">Alterar senha</h2>
          <form onSubmit={handleSenha} className="space-y-4">
            <div>
              <label className="label">Senha atual *</label>
              <input name="senhaAtual" type="password" required className="input" placeholder="Sua senha atual" />
            </div>
            <div>
              <label className="label">Nova senha *</label>
              <input name="novaSenha" type="password" required minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="label">Confirmar nova senha *</label>
              <input name="confirmar" type="password" required minLength={6} className="input" placeholder="Repita a nova senha" />
            </div>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
              {pending ? "Alterando…" : "Alterar senha"}
            </button>
          </form>
        </div>
      )}

      {/* ABA: SISTEMA */}
      {aba === "sistema" && (
        <div className="space-y-4 max-w-2xl">
          <div className="card p-6">
            <h2 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest">Informações do sistema</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Tag,      label: "Versão",            valor: "1.0.0 — Produção"          },
                { icon: Database, label: "Banco de dados",    valor: "PostgreSQL (Neon)"          },
                { icon: Server,   label: "Hospedagem",        valor: "Vercel (Serverless)"        },
                { icon: Lock,     label: "Autenticação",      valor: "NextAuth v4 + JWT"          },
              ].map(({ icon: Icon, label, valor }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "#F8FAFC", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div className="p-2 rounded-lg shrink-0" style={{ background: "#FFF7F4" }}>
                    <Icon className="w-4 h-4" style={{ color: "#E8500D" }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{label}</p>
                    <p className="text-slate-700 font-semibold text-sm">{valor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest">Roadmap</h2>
            <div className="space-y-2">
              {[
                { fase: "✅ Fase 1", desc: "Login, RDO completo, dashboard, PDF, WhatsApp" },
                { fase: "✅ Fase 2", desc: "PostgreSQL + Vercel deploy + usuários + relatórios" },
                { fase: "🔄 Fase 3", desc: "Login Microsoft Azure AD + SharePoint" },
                { fase: "🔄 Fase 4", desc: "Power BI Embedded + relatórios avançados" },
              ].map(({ fase, desc }) => (
                <div key={fase} className="flex gap-3 px-4 py-3 rounded-xl"
                  style={{ background: fase.startsWith("✅") ? "#FFF7F4" : "#F8FAFC", border: `1px solid ${fase.startsWith("✅") ? "rgba(232,80,13,0.12)" : "rgba(0,0,0,0.05)"}` }}>
                  <p className="text-sm font-bold" style={{ color: fase.startsWith("✅") ? "#E8500D" : "#64748B", minWidth: 80 }}>{fase}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
