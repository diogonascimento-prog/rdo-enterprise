import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, CloudRain, Clock, TrendingUp, Plus, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { HistogramaEfetivo } from "@/components/dashboard/HistogramaEfetivo";
import { CurvaS } from "@/components/dashboard/CurvaS";
import { GraficoOcorrencias } from "@/components/dashboard/GraficoOcorrencias";
import { DashboardObra } from "@/components/dashboard/DashboardObra";
import { prisma } from "@/lib/prisma";
import { formatarData } from "@/lib/utils";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Dashboard da Obra — RDO Enterprise" };

export default async function DashboardObraPage({ params }: { params: { obraId: string } }) {
  const obra = await prisma.obra.findUnique({
    where: { id: params.obraId },
    select: { id: true, nome: true, codigo: true, status: true, dataFimPrevisto: true, cidade: true, estado: true },
  });
  if (!obra) redirect("/obras");

  // ── Dados para KpiCards (Visão Geral) ──────────────────────────────────────
  const [totalRdos, diasChuva, acidentes, totalHHAgg, ultimosRdos] = await Promise.all([
    prisma.rdo.count({ where: { obraId: params.obraId, status: "APROVADO" } }),
    prisma.clima.count({ where: { condicao: { in: ["CHUVA_FORTE", "IMPRATICAVEL"] }, rdo: { obraId: params.obraId } } }),
    prisma.ocorrencia.count({ where: { tipo: { in: ["ACIDENTE_COM_AFASTAMENTO", "ACIDENTE_SEM_AFASTAMENTO"] }, rdo: { obraId: params.obraId } } }),
    prisma.maoDeObra.aggregate({ where: { rdo: { obraId: params.obraId, status: "APROVADO" } }, _sum: { horasTrabalhadas: true, horasExtras: true } }),
    prisma.rdo.findMany({
      where: { obraId: params.obraId },
      orderBy: { data: "desc" },
      take: 5,
      select: { id: true, numero: true, data: true, status: true, elaborador: { select: { nome: true } }, _count: { select: { ocorrencias: true } } },
    }),
  ]);
  const totalHH = (totalHHAgg._sum.horasTrabalhadas ?? 0) + (totalHHAgg._sum.horasExtras ?? 0);

  // ── RDO mais recente (para aba Diário) ─────────────────────────────────────
  const rdoRecenteRaw = await prisma.rdo.findFirst({
    where: { obraId: params.obraId },
    orderBy: { data: "desc" },
    include: {
      elaborador: { select: { nome: true } },
      atividades: true,
      maoDeObra: true,
      clima: { orderBy: { periodo: "asc" } },
      ocorrencias: true,
    },
  });

  // ── Dados da semana (últimos 7 dias) ───────────────────────────────────────
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

  const rdosSemana = await prisma.rdo.findMany({
    where: { obraId: params.obraId, data: { gte: seteDiasAtras } },
    orderBy: { data: "asc" },
    include: { maoDeObra: true, atividades: true },
  });

  const semana = rdosSemana.map(r => ({
    data: r.data.toISOString().split("T")[0],
    totalPessoas: r.maoDeObra.reduce((a, m) => a + m.quantidade, 0),
    totalHH: r.maoDeObra.reduce((a, m) => a + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0),
    atividades: r.atividades.length,
  }));

  // ── Resumo por frente (AtividadePlanejada) ─────────────────────────────────
  const atividadesPlanejadas = await prisma.atividadePlanejada.findMany({
    where: { obraId: params.obraId },
    include: { atividadesRdo: { include: { rdo: { select: { status: true } } } } },
  });

  const hoje = new Date();
  const frentesMap: Record<string, { total: number; andamento: number; planejadas: number; atrasadas: number }> = {};

  for (const ap of atividadesPlanejadas) {
    const frente = ap.frente ?? "GERAL";
    if (!frentesMap[frente]) frentesMap[frente] = { total: 0, andamento: 0, planejadas: 0, atrasadas: 0 };
    frentesMap[frente].total++;

    const aprovados = ap.atividadesRdo.filter(a => a.rdo.status === "APROVADO");
    const executado = aprovados.reduce((acc, a) => acc + (a.quantidadeRealizada ?? 0), 0);
    const pct = ap.quantidadeTotal && ap.quantidadeTotal > 0 ? (executado / ap.quantidadeTotal) * 100 : 0;

    if (pct >= 100) {
      // concluída — não conta nas demais
    } else if (pct > 0) {
      frentesMap[frente].andamento++;
    } else if (ap.dataFimPrev < hoje) {
      frentesMap[frente].atrasadas++;
    } else {
      frentesMap[frente].planejadas++;
    }
  }

  const frentesResumo = Object.entries(frentesMap).map(([frente, v]) => ({ frente, ...v }));

  const STATUS_RDO: Record<string, { label: string; bg: string; text: string }> = {
    APROVADO:           { label: "Aprovado",  bg: "bg-green-50",  text: "text-green-700"  },
    PENDENTE_APROVACAO: { label: "Pendente",  bg: "bg-amber-50",  text: "text-amber-700"  },
    RASCUNHO:           { label: "Rascunho",  bg: "bg-slate-100", text: "text-slate-600"  },
    REJEITADO:          { label: "Rejeitado", bg: "bg-red-50",    text: "text-red-700"    },
  };

  // Serializar para o client component
  const rdoRecente = rdoRecenteRaw ? {
    id: rdoRecenteRaw.id,
    numero: rdoRecenteRaw.numero,
    data: rdoRecenteRaw.data.toISOString().split("T")[0],
    turno: rdoRecenteRaw.turno,
    status: rdoRecenteRaw.status,
    observacaoGeral: rdoRecenteRaw.observacaoGeral,
    elaborador: { nome: rdoRecenteRaw.elaborador.nome },
    clima: rdoRecenteRaw.clima.map(c => ({ periodo: c.periodo, condicao: c.condicao, temperatura: c.temperatura })),
    maoDeObra: rdoRecenteRaw.maoDeObra.map(m => ({
      funcao: m.funcao, funcaoDescricao: m.funcaoDescricao, tipo: m.tipo,
      quantidade: m.quantidade, horasTrabalhadas: m.horasTrabalhadas,
      horasExtras: m.horasExtras, empresa: m.empresa,
    })),
    atividades: rdoRecenteRaw.atividades.map(a => ({
      descricao: a.descricao, frente: a.frente,
      quantidadeRealizada: a.quantidadeRealizada,
      unidade: a.unidade, percentualAvancoDia: a.percentualAvancoDia,
    })),
    ocorrencias: rdoRecenteRaw.ocorrencias.map(o => ({
      tipo: o.tipo, descricao: o.descricao, gravidade: o.gravidade,
    })),
  } : null;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/obras" className="hover:text-brand-orange flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Obras
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-medium truncate max-w-[200px]">{obra.nome}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{obra.nome}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs font-mono text-slate-400">{obra.codigo}</span>
            {obra.cidade && <span className="text-xs text-slate-400">· {obra.cidade}, {obra.estado}</span>}
            <span className="text-xs text-slate-400">· Prazo: {formatarData(obra.dataFimPrevisto)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/obras/${obra.id}/rdos`}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            Ver RDOs
          </Link>
          <Link href={`/obras/${obra.id}/rdos/novo`} className="btn-primary text-sm px-4 py-2.5">
            <Plus className="w-4 h-4" /> Novo RDO
          </Link>
        </div>
      </div>

      {/* ── DashboardObra (tabs + KPI strip) ──────────────── */}
      <DashboardObra
        obraId={obra.id}
        obraInfo={{ nome: obra.nome, codigo: obra.codigo }}
        frentesResumo={frentesResumo}
        rdoRecente={rdoRecente}
        semana={semana}
      >
        {/* ── Conteúdo da aba Visão Geral ─── */}
        <div className="space-y-5">

          {/* KpiCards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard titulo="Dias sem acidentes" valor={acidentes === 0 ? `${totalRdos}` : "0"}
              subtitulo={acidentes === 0 ? "✓ Nenhum acidente registrado" : `${acidentes} acidente(s)`}
              icone={ShieldCheck} cor="green" tendencia={{ valor: 12, label: "vs. mês anterior" }} />
            <KpiCard titulo="Paralisações — Chuva" valor={diasChuva}
              subtitulo="períodos com impacto climático"
              icone={CloudRain} cor="dark" />
            <KpiCard titulo="Horas-Homem" valor={totalHH.toLocaleString("pt-BR")}
              subtitulo={`${totalRdos} RDOs aprovados`}
              icone={Clock} cor="orange" tendencia={{ valor: 5, label: "vs. semana anterior" }} />
            <KpiCard titulo="Avanço Físico" valor="29,4%"
              subtitulo="Desvio atual: −7,6%"
              icone={TrendingUp} cor="red" />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <HistogramaEfetivo mediaPrevista={220} />
            </div>
            <GraficoOcorrencias />
          </div>

          <CurvaS />

          {/* Últimos RDOs */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Últimos RDOs</h3>
              <Link href={`/obras/${obra.id}/rdos`} className="text-xs font-semibold hover:underline" style={{ color: "#E8500D" }}>
                Ver todos →
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-semibold">Nº</th>
                  <th className="text-left px-6 py-3 font-semibold">Data</th>
                  <th className="text-left px-6 py-3 font-semibold">Elaborador</th>
                  <th className="text-left px-6 py-3 font-semibold">Ocorrências</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ultimosRdos.map((rdo) => {
                  const st = STATUS_RDO[rdo.status] ?? STATUS_RDO.RASCUNHO;
                  return (
                    <tr key={rdo.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-500">#{String(rdo.numero).padStart(3, "0")}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-700">{formatarData(rdo.data)}</td>
                      <td className="px-6 py-3.5 text-slate-500">{rdo.elaborador.nome}</td>
                      <td className="px-6 py-3.5">
                        {rdo._count.ocorrencias > 0
                          ? <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-xs"><AlertTriangle className="w-3.5 h-3.5" />{rdo._count.ocorrencias}</span>
                          : <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3.5 h-3.5" />Nenhuma</span>}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`badge ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link href={`/obras/${obra.id}/rdos/${rdo.id}`} className="text-xs font-semibold hover:underline" style={{ color: "#E8500D" }}>
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardObra>

    </div>
  );
}
