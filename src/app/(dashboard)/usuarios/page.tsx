import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, UserCheck, UserX, Pencil, Shield } from "lucide-react";
import { ToggleUsuario } from "./ToggleUsuario";

export const metadata: Metadata = { title: "Usuários — RDO Enterprise" };

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:            { label: "Admin",             color: "#DC2626", bg: "#FEF2F2" },
  GESTOR_PORTFOLIO: { label: "Gestor Portfólio",  color: "#7C3AED", bg: "#F5F3FF" },
  ENGENHEIRO:       { label: "Engenheiro",        color: "#2563EB", bg: "#EFF6FF" },
  APROVADOR:        { label: "Aprovador",         color: "#0891B2", bg: "#ECFEFF" },
  MESTRE_OBRA:      { label: "Mestre de Obra",    color: "#D97706", bg: "#FFFBEB" },
  ELABORADOR:       { label: "Elaborador",        color: "#E8500D", bg: "#FFF7F4" },
  VISUALIZADOR:     { label: "Visualizador",      color: "#64748B", bg: "#F8FAFC" },
};

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  const isAdmin = ["ADMIN", "GESTOR_PORTFOLIO"].includes(me?.role ?? "");

  const usuarios = await prisma.usuario.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: { _count: { select: { rdosElaborados: true, rdosAprovados: true } } },
  });

  const ativos   = usuarios.filter(u => u.ativo).length;
  const inativos = usuarios.filter(u => !u.ativo).length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-orange-gradient" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistema</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-400 mt-1">Gerencie acessos e permissões do sistema</p>
        </div>
        {isAdmin && (
          <Link href="/usuarios/novo" className="btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Novo Usuário
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", valor: usuarios.length, color: "#1E293B", gradient: "linear-gradient(135deg,#1E293B,#334155)" },
          { label: "Ativos", valor: ativos, color: "#16A34A", gradient: "linear-gradient(135deg,#16A34A,#22C55E)" },
          { label: "Inativos", valor: inativos, color: "#DC2626", gradient: "linear-gradient(135deg,#DC2626,#EF4444)" },
        ].map(({ label, valor, gradient }) => (
          <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4"
            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="shrink-0 p-3 rounded-xl" style={{ background: gradient }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black"
                style={{ background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {valor}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <p className="section-title">Todos os usuários</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#FAFAFA" }}>
                {["Usuário", "Cargo / Registro", "Perfil", "RDOs", "Status", ""].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const role = ROLE_LABEL[u.role] ?? ROLE_LABEL.ELABORADOR;
                const initials = u.nome.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                    className={`transition-colors hover:bg-slate-50 ${!u.ativo ? "opacity-50" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0"
                          style={{ background: u.ativo ? "linear-gradient(135deg,#E8500D,#F97316)" : "#94A3B8" }}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.nome}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 font-medium">{u.cargo || "—"}</p>
                      {u.registro && <p className="text-xs text-slate-400">{u.registro}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: role.bg, color: role.color }}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold">{u._count.rdosElaborados}</span>
                        <span className="text-slate-400"> elaborados</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {u._count.rdosAprovados} aprovados
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {u.ativo
                          ? <><UserCheck className="w-3.5 h-3.5 text-green-500" /><span className="text-xs font-semibold text-green-600">Ativo</span></>
                          : <><UserX className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs font-semibold text-slate-400">Inativo</span></>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Link href={`/usuarios/${u.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-orange hover:bg-orange-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <ToggleUsuario id={u.id} ativo={u.ativo} meuId={me?.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
