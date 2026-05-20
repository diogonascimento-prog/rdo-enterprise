import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarData } from "@/lib/utils";
import {
  HardHat, Plus, MapPin, Calendar, FileText,
  BarChart2, ArrowUpRight, TrendingUp, Activity,
} from "lucide-react";

export const metadata: Metadata = { title: "Obras — RDO Enterprise" };

const STATUS: Record<string, { label: string; dot: string; bg: string; text: string; barColor: string }> = {
  PLANEJAMENTO: { label: "Planejamento", dot: "bg-slate-400",  bg: "bg-slate-100",  text: "text-slate-600",  barColor: "#94A3B8" },
  EM_ANDAMENTO: { label: "Em andamento", dot: "bg-orange-500", bg: "bg-orange-50",  text: "text-orange-700", barColor: "#E8500D" },
  PARALISADA:   { label: "Paralisada",   dot: "bg-amber-400",  bg: "bg-amber-50",   text: "text-amber-700",  barColor: "#F59E0B" },
  CONCLUIDA:    { label: "Concluída",    dot: "bg-green-500",  bg: "bg-green-50",   text: "text-green-700",  barColor: "#22C55E" },
  CANCELADA:    { label: "Cancelada",    dot: "bg-red-400",    bg: "bg-red-50",     text: "text-red-700",    barColor: "#EF4444" },
};

const GRADIENT: Record<string, string> = {
  EM_ANDAMENTO: "linear-gradient(135deg, #E8500D 0%, #F97316 100%)",
  CONCLUIDA:    "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
  PARALISADA:   "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
  PLANEJAMENTO: "linear-gradient(135deg, #475569 0%, #64748B 100%)",
  CANCELADA:    "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
};

export default async function ObrasPage() {
  const obras = await prisma.obra.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      _count: { select: { rdos: true } },
      rdos: {
        where: { status: "APROVADO" }, orderBy: { data: "desc" }, take: 1, select: { data: true },
      },
    },
  });

  const stats = {
    total:       obras.length,
    emAndamento: obras.filter(o => o.status === "EM_ANDAMENTO").length,
    totalRdos:   obras.reduce((a, o) => a + o._count.rdos, 0),
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-orange-gradient" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gestão</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Obras</h1>
          <p className="text-sm text-slate-400 mt-1">Gerencie e acompanhe todos os seus projetos</p>
        </div>
        <Link href="/obras/nova" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> Nova Obra
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: HardHat,   label: "Total de obras",    valor: stats.total,
            gradient: "linear-gradient(135deg,#1E293B,#334155)", shadow: "rgba(30,41,59,0.25)" },
          { icon: TrendingUp, label: "Em andamento",     valor: stats.emAndamento,
            gradient: "linear-gradient(135deg,#E8500D,#F97316)", shadow: "rgba(232,80,13,0.25)" },
          { icon: Activity,   label: "RDOs registrados", valor: stats.totalRdos,
            gradient: "linear-gradient(135deg,#7C3AED,#A855F7)", shadow: "rgba(124,58,237,0.25)" },
        ].map(({ icon: Icon, label, valor, gradient, shadow }) => (
          <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
            <div className="shrink-0 p-3 rounded-xl" style={{ background: gradient, boxShadow: `0 4px 12px ${shadow}` }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black tabular-nums"
                style={{ background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {valor}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid de obras */}
      {obras.length === 0 ? (
        <div className="bg-white rounded-2xl py-24 text-center"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <HardHat className="w-8 h-8 text-slate-200" />
          </div>
          <p className="text-slate-600 font-bold">Nenhuma obra cadastrada</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Comece criando sua primeira obra</p>
          <Link href="/obras/nova" className="btn-primary">
            <Plus className="w-4 h-4" /> Nova Obra
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {obras.map((obra) => {
            const st = STATUS[obra.status] ?? STATUS.EM_ANDAMENTO;
            const grad = GRADIENT[obra.status] ?? GRADIENT.PLANEJAMENTO;
            return (
              <div key={obra.id}
                className="card card-hover overflow-hidden group"
              >
                {/* Top gradient bar */}
                <div className="h-1 w-full" style={{ background: grad }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="p-2.5 rounded-xl shrink-0 transition-all group-hover:scale-110 duration-200"
                      style={{ background: grad, boxShadow: `0 4px 12px ${obra.status === "EM_ANDAMENTO" ? "rgba(232,80,13,0.3)" : "rgba(0,0,0,0.15)"}` }}>
                      <HardHat className="w-4 h-4 text-white" />
                    </div>
                    <span className={`badge ${st.bg} ${st.text} shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  {/* Info */}
                  <h3 className="font-bold text-slate-800 text-base leading-snug mb-1 line-clamp-2 group-hover:text-brand-orange transition-colors">
                    {obra.nome}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mb-4">{obra.codigo}</p>

                  <div className="space-y-2">
                    {obra.cidade && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        {obra.cidade}, {obra.estado}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      Prazo: {formatarData(obra.dataFimPrevisto)}
                    </div>
                    {obra.rdos[0] && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        Último RDO: {formatarData(obra.rdos[0].data)}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 flex items-center justify-between"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black tabular-nums text-slate-700">{obra._count.rdos}</span>
                      <span className="text-xs text-slate-400">RDO{obra._count.rdos !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/obras/${obra.id}/rdos`}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1">
                        <FileText className="w-3 h-3" /> RDOs
                      </Link>
                      <span className="text-slate-200">·</span>
                      <Link href={`/obras/${obra.id}/dashboard`}
                        className="text-xs font-bold text-brand-orange flex items-center gap-1 hover:underline">
                        <BarChart2 className="w-3 h-3" /> Dashboard
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
