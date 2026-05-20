import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarData } from "@/lib/utils";
import { Plus, CheckCircle, Clock, XCircle, FileText, ArrowLeft, AlertTriangle, Users } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "RDOs — RDO Enterprise" };

const STATUS: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  RASCUNHO:           { label: "Rascunho",           bg: "bg-slate-100", text: "text-slate-600",  icon: FileText    },
  PENDENTE_APROVACAO: { label: "Aguard. aprovação",  bg: "bg-amber-50",  text: "text-amber-700",  icon: Clock       },
  APROVADO:           { label: "Aprovado",            bg: "bg-green-50",  text: "text-green-700",  icon: CheckCircle },
  REJEITADO:          { label: "Rejeitado",           bg: "bg-red-50",    text: "text-red-700",    icon: XCircle     },
};

export default async function RdosPage({ params }: { params: { obraId: string } }) {
  const obra = await prisma.obra.findUnique({
    where: { id: params.obraId },
    select: { id: true, nome: true, codigo: true },
  });
  if (!obra) redirect("/obras");

  const rdos = await prisma.rdo.findMany({
    where: { obraId: params.obraId },
    orderBy: { data: "desc" },
    include: {
      elaborador: { select: { nome: true } },
      _count: { select: { atividades: true, ocorrencias: true, maoDeObra: true } },
    },
  });

  const aprovados  = rdos.filter(r => r.status === "APROVADO").length;
  const pendentes  = rdos.filter(r => r.status === "PENDENTE_APROVACAO").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/obras" className="hover:text-brand-orange flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Obras
            </Link>
            <span>/</span>
            <Link href={`/obras/${obra.id}/dashboard`} className="hover:text-brand-orange">{obra.nome}</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">RDOs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios Diários</h1>
          <p className="text-sm text-slate-400 mt-0.5 font-mono">{obra.codigo}</p>
        </div>
        <Link href={`/obras/${obra.id}/rdos/novo`} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> Novo RDO
        </Link>
      </div>

      {/* Sumário */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total de RDOs",     valor: rdos.length,  cor: "text-slate-800" },
          { label: "Aprovados",          valor: aprovados,    cor: "text-green-700" },
          { label: "Aguardando",         valor: pendentes,    cor: "text-amber-700" },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${cor}`}>{valor}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {rdos.length === 0 ? (
          <div className="py-24 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Nenhum RDO registrado</p>
            <p className="text-sm text-slate-300 mt-1 mb-6">Crie o primeiro relatório diário</p>
            <Link href={`/obras/${obra.id}/rdos/novo`} className="btn-primary">
              <Plus className="w-4 h-4" /> Novo RDO
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3.5 font-semibold">Nº / Data</th>
                <th className="text-left px-6 py-3.5 font-semibold">Elaborador</th>
                <th className="text-center px-4 py-3.5 font-semibold">Atividades</th>
                <th className="text-center px-4 py-3.5 font-semibold">Efetivo</th>
                <th className="text-center px-4 py-3.5 font-semibold">Ocorrências</th>
                <th className="text-left px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rdos.map((rdo) => {
                const st = STATUS[rdo.status] ?? STATUS.RASCUNHO;
                const StIcon = st.icon;
                return (
                  <tr key={rdo.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 font-mono">#{String(rdo.numero).padStart(3, "0")}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatarData(rdo.data)}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{rdo.elaborador.nome}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-50 rounded-lg text-xs font-bold text-slate-600">
                        {rdo._count.atividades}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-300" />
                        {rdo._count.maoDeObra}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {rdo._count.ocorrencias > 0
                        ? <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                            <AlertTriangle className="w-3 h-3" />{rdo._count.ocorrencias}
                          </span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${st.bg} ${st.text}`}>
                        <StIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/obras/${obra.id}/rdos/${rdo.id}`}
                        className="text-xs font-bold opacity-0 group-hover:opacity-100 hover:underline transition-opacity"
                        style={{ color: "#E8500D" }}>
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
