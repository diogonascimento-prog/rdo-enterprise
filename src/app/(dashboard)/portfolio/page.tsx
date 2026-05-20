import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatarData } from "@/lib/utils";
import {
  HardHat, TrendingUp, Clock, AlertTriangle, ShieldCheck,
  CloudRain, FileText, BarChart2, CheckCircle, XCircle,
  Upload, ArrowUpRight, Activity, Layers,
} from "lucide-react";
import Link from "next/link";
import { PortfolioCharts } from "@/components/dashboard/PortfolioCharts";

export const metadata: Metadata = { title: "Dashboard Geral — RDO Enterprise" };

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PLANEJAMENTO: { label: "Planejamento", bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400"  },
  EM_ANDAMENTO: { label: "Em andamento", bg: "bg-orange-50",  text: "text-orange-700", dot: "bg-orange-500" },
  PARALISADA:   { label: "Paralisada",   bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-400"  },
  CONCLUIDA:    { label: "Concluída",    bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-500"  },
  CANCELADA:    { label: "Cancelada",    bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-400"    },
};

export default async function PortfolioPage() {
  const obras = await prisma.obra.findMany({
    orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
    include: {
      _count: { select: { rdos: true } },
      rdos: {
        where: { status: "APROVADO" },
        orderBy: { data: "desc" },
        take: 1,
        select: { data: true },
      },
    },
  });

  const [hhAgg, acidentes, diasChuva, rdosPendentes, rdosAprovados, ocorrenciasCriticas] =
    await Promise.all([
      prisma.maoDeObra.aggregate({
        where: { rdo: { status: "APROVADO" } },
        _sum: { horasTrabalhadas: true, horasExtras: true },
      }),
      prisma.ocorrencia.count({
        where: { tipo: { in: ["ACIDENTE_COM_AFASTAMENTO", "ACIDENTE_SEM_AFASTAMENTO"] } },
      }),
      prisma.clima.count({
        where: { condicao: { in: ["CHUVA_FORTE", "IMPRATICAVEL"] } },
      }),
      prisma.rdo.count({ where: { status: "PENDENTE_APROVACAO" } }),
      prisma.rdo.count({ where: { status: "APROVADO" } }),
      prisma.ocorrencia.findMany({
        where: { gravidade: { in: ["ALTA", "CRITICA"] } },
        orderBy: { rdo: { data: "desc" } },
        take: 5,
        select: {
          id: true, tipo: true, gravidade: true, descricao: true,
          rdo: { select: { data: true, obra: { select: { nome: true, id: true } } } },
        },
      }),
    ]);

  const totalHH = (hhAgg._sum.horasTrabalhadas ?? 0) + (hhAgg._sum.horasExtras ?? 0);
  const totalObras   = obras.length;
  const emAndamento  = obras.filter(o => o.status === "EM_ANDAMENTO").length;
  const concluidas   = obras.filter(o => o.status === "CONCLUIDA").length;
  const paralisadas  = obras.filter(o => o.status === "PARALISADA").length;

  const chartObras = obras.map(o => ({
    nome: o.nome.length > 18 ? o.nome.slice(0, 18) + "…" : o.nome,
    rdos: o._count.rdos,
    status: o.status,
  }));

  const statusDist = [
    { name: "Em andamento", value: emAndamento, fill: "#E8500D" },
    { name: "Concluídas",   value: concluidas,  fill: "#22C55E" },
    { name: "Paralisadas",  value: paralisadas, fill: "#F59E0B" },
    { name: "Planejamento", value: obras.filter(o => o.status === "PLANEJAMENTO").length, fill: "#94A3B8" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-7">

      {/* ── Page header ───────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-orange-gradient" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portfólio</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Geral</h1>
          <p className="text-sm text-slate-400 mt-1">Visão consolidada de todo o portfólio ENGETECNICA</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/importar"
            className="btn-secondary text-sm">
            <Upload className="w-4 h-4" /> Importar
          </Link>
          <Link href="/obras/nova" className="btn-primary text-sm">
            <HardHat className="w-4 h-4" /> Nova Obra
          </Link>
        </div>
      </div>

      {/* ── KPIs principais ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total obras */}
        <div className="bg-white rounded-2xl p-5 overflow-hidden relative transition-all duration-200 hover:-translate-y-0.5"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
          <div className="h-[3px] absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg,#1E293B,#475569)" }} />
          <div className="flex items-start justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total de Obras</p>
            <div className="p-2 rounded-lg" style={{ background: "linear-gradient(135deg,#1E293B,#334155)", boxShadow: "0 3px 8px rgba(30,41,59,0.3)" }}>
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums" style={{ background: "linear-gradient(135deg,#1E293B,#475569)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{totalObras}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">{emAndamento} em andamento · {concluidas} concluída{concluidas !== 1 ? "s" : ""}</p>
        </div>

        {/* Horas-Homem */}
        <div className="bg-white rounded-2xl p-5 overflow-hidden relative transition-all duration-200 hover:-translate-y-0.5"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
          <div className="h-[3px] absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg,#E8500D,#F97316)" }} />
          <div className="flex items-start justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas-Homem</p>
            <div className="p-2 rounded-lg" style={{ background: "linear-gradient(135deg,#E8500D,#F97316)", boxShadow: "0 3px 8px rgba(232,80,13,0.3)" }}>
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums" style={{ background: "linear-gradient(135deg,#E8500D,#F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{totalHH.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">{rdosAprovados} RDOs aprovados</p>
        </div>

        {/* Segurança */}
        <div className="bg-white rounded-2xl p-5 overflow-hidden relative transition-all duration-200 hover:-translate-y-0.5"
          style={{ border: `1px solid ${acidentes === 0 ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
          <div className="h-[3px] absolute top-0 left-0 right-0" style={{ background: acidentes === 0 ? "linear-gradient(90deg,#16A34A,#22C55E)" : "linear-gradient(90deg,#DC2626,#EF4444)" }} />
          <div className="flex items-start justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acidentes</p>
            <div className="p-2 rounded-lg" style={{ background: acidentes === 0 ? "linear-gradient(135deg,#16A34A,#22C55E)" : "linear-gradient(135deg,#DC2626,#EF4444)", boxShadow: acidentes === 0 ? "0 3px 8px rgba(22,163,74,0.3)" : "0 3px 8px rgba(220,38,38,0.3)" }}>
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums" style={{ background: acidentes === 0 ? "linear-gradient(135deg,#16A34A,#22C55E)" : "linear-gradient(135deg,#DC2626,#EF4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{acidentes}</p>
          <p className="text-xs mt-2 font-medium" style={{ color: acidentes === 0 ? "#16A34A" : "#DC2626" }}>
            {acidentes === 0 ? "✓ Portfólio sem acidentes" : `${acidentes} acidente${acidentes !== 1 ? "s" : ""} registrado${acidentes !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Pendentes */}
        <div className="rounded-2xl p-5 overflow-hidden relative transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 16px rgba(15,23,42,0.25), 0 1px 3px rgba(15,23,42,0.15)",
          }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(232,80,13,0.6), transparent 60%)" }} />
          <div className="flex items-start justify-between mb-4 relative">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Pendentes</p>
            <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums text-white relative">{rdosPendentes}</p>
          <p className="text-xs mt-2 font-medium relative" style={{ color: "rgba(255,255,255,0.35)" }}>RDOs aguardando aprovação</p>
        </div>
      </div>

      {/* ── KPIs secundários ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: "Paralisadas", valor: paralisadas, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
          { icon: TrendingUp,    label: "Concluídas",  valor: concluidas,  color: "#22C55E", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.15)"  },
          { icon: CloudRain,     label: "Impactos de chuva", valor: diasChuva, color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)" },
          { icon: Activity,      label: "Total de RDOs", valor: rdosAprovados + rdosPendentes, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
        ].map(({ icon: Icon, label, valor, color, bg, border }) => (
          <div key={label}
            className="bg-white rounded-xl p-4 flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-black tabular-nums" style={{ color }}>{valor}</p>
              <p className="text-[11px] text-slate-400 font-medium leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráficos ──────────────────────────────────── */}
      <PortfolioCharts obras={chartObras} statusDist={statusDist} />

      {/* ── Alertas — obras paralisadas ───────────────── */}
      {paralisadas > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.20)" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.15)" }}>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-amber-800 text-sm">
              {paralisadas} obra{paralisadas !== 1 ? "s" : ""} paralisada{paralisadas !== 1 ? "s" : ""}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {obras.filter(o => o.status === "PARALISADA").map(obra => (
              <Link key={obra.id} href={`/obras/${obra.id}/dashboard`}
                className="bg-white rounded-xl px-4 py-3 hover:shadow-md transition-all group flex items-center justify-between"
                style={{ border: "1px solid rgba(245,158,11,0.15)" }}>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-amber-700 transition-colors">{obra.nome}</p>
                  <p className="text-xs text-amber-600 mt-0.5">Prazo: {formatarData(obra.dataFimPrevisto)}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 shrink-0 ml-2 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Ocorrências críticas ──────────────────────── */}
      {ocorrenciasCriticas.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
          <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
            <div className="p-1.5 rounded-lg bg-red-50">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Ocorrências críticas recentes</h3>
          </div>
          <div className="divide-y divide-slate-50/80">
            {ocorrenciasCriticas.map(oc => (
              <div key={oc.id} className="px-6 py-4 flex items-start gap-3.5 hover:bg-slate-50/50 transition-colors group">
                <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${oc.gravidade === "CRITICA" ? "bg-red-500" : "bg-orange-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700 truncate">{oc.descricao}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="font-medium text-slate-500">{oc.rdo.obra.nome}</span>
                    {" · "}{formatarData(oc.rdo.data)}
                    {" · "}
                    <span className={`font-bold ${oc.gravidade === "CRITICA" ? "text-red-600" : "text-orange-600"}`}>
                      {oc.gravidade}
                    </span>
                  </p>
                </div>
                <Link href={`/obras/${oc.rdo.obra.id}/dashboard`}
                  className="shrink-0 text-xs font-bold text-slate-300 group-hover:text-brand-orange transition-colors flex items-center gap-0.5">
                  Ver <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabela completa ───────────────────────────── */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Todas as obras</h3>
            <p className="text-xs text-slate-400 mt-0.5">{totalObras} projeto{totalObras !== 1 ? "s" : ""} no portfólio</p>
          </div>
          <Link href="/obras" className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-0.5">
            Gerenciar <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {obras.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <HardHat className="w-7 h-7 text-slate-200" />
            </div>
            <p className="text-slate-500 font-semibold text-sm">Nenhuma obra cadastrada</p>
            <p className="text-xs text-slate-300 mt-1 mb-5">Cadastre manualmente ou importe via Excel</p>
            <div className="flex gap-3 justify-center">
              <Link href="/obras/nova" className="btn-primary text-sm"><HardHat className="w-4 h-4" /> Nova obra</Link>
              <Link href="/importar" className="btn-secondary text-sm"><Upload className="w-4 h-4" /> Importar</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.015)" }}>
                  {["Obra", "Localização", "Prazo", "RDOs", "Último RDO", "Status", ""].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {obras.map((obra, i) => {
                  const st = STATUS_MAP[obra.status] ?? STATUS_MAP.EM_ANDAMENTO;
                  return (
                    <tr key={obra.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                      style={{ borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.04)" }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: obra.status === "EM_ANDAMENTO" ? "linear-gradient(135deg,#E8500D,#F97316)" :
                                         obra.status === "CONCLUIDA"    ? "linear-gradient(135deg,#16A34A,#22C55E)" :
                                         obra.status === "PARALISADA"   ? "linear-gradient(135deg,#D97706,#F59E0B)" :
                                         "linear-gradient(135deg,#64748B,#94A3B8)",
                            }}>
                            <HardHat className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight group-hover:text-brand-orange transition-colors">{obra.nome}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{obra.codigo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {obra.cidade ? `${obra.cidade}, ${obra.estado}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 tabular-nums font-medium">
                        {formatarData(obra.dataFimPrevisto)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black tabular-nums text-slate-700">{obra._count.rdos}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {obra.rdos[0] ? formatarData(obra.rdos[0].data) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/obras/${obra.id}/rdos`}
                            className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-0.5 transition-colors">
                            <FileText className="w-3 h-3" /> RDOs
                          </Link>
                          <Link href={`/obras/${obra.id}/dashboard`}
                            className="text-xs font-bold text-brand-orange flex items-center gap-0.5">
                            <BarChart2 className="w-3 h-3" /> Dashboard
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Status bar ────────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 pb-2">
        {[
          { icon: CheckCircle, color: "text-green-400", valor: rdosAprovados, label: "aprovados" },
          { icon: Clock,       color: "text-amber-400", valor: rdosPendentes, label: "pendentes" },
          { icon: XCircle,     color: "text-red-400",   valor: acidentes,     label: "acidentes" },
        ].map(({ icon: Icon, color, valor, label }) => (
          <div key={label} className={`flex items-center gap-1.5 text-xs font-semibold text-slate-400`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className="font-black text-slate-700">{valor}</span> {label}
          </div>
        ))}
      </div>
    </div>
  );
}
