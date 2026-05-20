import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatarData } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle, XCircle, Clock, FileText,
  CloudSun, Users, Wrench, CheckSquare, Package,
  AlertTriangle, Sun, CloudRain, Wind, CloudSnow, Printer,
} from "lucide-react";
import { CopiarWhatsApp } from "@/components/rdo/CopiarWhatsApp";

export const metadata: Metadata = { title: "RDO — RDO Enterprise" };

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  RASCUNHO:           { bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200",  label: "Rascunho"          },
  PENDENTE_APROVACAO: { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  label: "Aguard. aprovação" },
  APROVADO:           { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200",  label: "Aprovado"          },
  REJEITADO:          { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200",    label: "Rejeitado"         },
};

const CONDICAO_ICON: Record<string, React.ElementType> = {
  BOM: Sun, NUBLADO: CloudSun, CHUVA_LEVE: CloudRain,
  CHUVA_FORTE: CloudRain, IMPRATICAVEL: CloudRain,
  VENTANIA: Wind, NEBLINA: CloudSnow,
};
const CONDICAO_LABEL: Record<string, string> = {
  BOM: "Bom", NUBLADO: "Nublado", CHUVA_LEVE: "Chuva leve",
  CHUVA_FORTE: "Chuva forte", IMPRATICAVEL: "Impraticável",
  VENTANIA: "Ventania", NEBLINA: "Neblina",
};
const PERIODO_LABEL: Record<string, string> = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };
const GRAVIDADE_STYLE: Record<string, string> = {
  BAIXA: "bg-blue-50 text-blue-700", MEDIA: "bg-amber-50 text-amber-700",
  ALTA: "bg-orange-50 text-orange-700", CRITICA: "bg-red-50 text-red-700",
};

export default async function RdoPage({
  params,
}: {
  params: { obraId: string; rdoId: string };
}) {
  const session = await getServerSession(authOptions);
  const userId  = (session?.user as any)?.id  as string | undefined;
  const role    = (session?.user as any)?.role as string | undefined;

  const rdo = await prisma.rdo.findUnique({
    where: { id: params.rdoId },
    include: {
      obra:        { select: { id: true, nome: true, codigo: true } },
      elaborador:  { select: { nome: true, cargo: true } },
      aprovador:   { select: { nome: true, cargo: true } },
      clima:       { orderBy: { periodo: "asc" } },
      maoDeObra:   true,
      equipamentos: true,
      atividades:  { include: { atividadePlanejada: { select: { wbs: true } } } },
      materiais:   true,
      ocorrencias: true,
    },
  });

  if (!rdo || rdo.obra.id !== params.obraId) redirect(`/obras/${params.obraId}/rdos`);

  const canApprove = (role === "APROVADOR" || role === "ENGENHEIRO" || role === "GESTOR_PORTFOLIO" || role === "ADMIN")
    && rdo.status === "PENDENTE_APROVACAO";

  // Server Actions
  async function aprovar() {
    "use server";
    const sess = await getServerSession(authOptions);
    const uid = (sess?.user as any)?.id as string;
    await prisma.rdo.update({
      where: { id: params.rdoId },
      data: { status: "APROVADO", aprovadorId: uid },
    });
    redirect(`/obras/${params.obraId}/rdos/${params.rdoId}`);
  }

  async function rejeitar(fd: FormData) {
    "use server";
    const motivo = fd.get("motivoRejeicao") as string;
    const sess = await getServerSession(authOptions);
    const uid = (sess?.user as any)?.id as string;
    await prisma.rdo.update({
      where: { id: params.rdoId },
      data: { status: "REJEITADO", aprovadorId: uid, motivoRejeicao: motivo || "Sem motivo informado" },
    });
    redirect(`/obras/${params.obraId}/rdos/${params.rdoId}`);
  }

  const st = STATUS_STYLE[rdo.status] ?? STATUS_STYLE.RASCUNHO;
  const totalHH = rdo.maoDeObra.reduce(
    (acc, m) => acc + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0
  );

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/obras" className="hover:text-brand-orange flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Obras
          </Link>
          <span>/</span>
          <Link href={`/obras/${rdo.obra.id}/rdos`} className="hover:text-brand-orange">{rdo.obra.nome}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">RDO #{String(rdo.numero).padStart(3, "0")}</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">
                RDO #{String(rdo.numero).padStart(3, "0")}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                {rdo.status === "APROVADO"           && <CheckCircle className="w-3 h-3" />}
                {rdo.status === "REJEITADO"          && <XCircle className="w-3 h-3" />}
                {rdo.status === "PENDENTE_APROVACAO" && <Clock className="w-3 h-3" />}
                {rdo.status === "RASCUNHO"           && <FileText className="w-3 h-3" />}
                {st.label}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {formatarData(rdo.data)} · Turno {rdo.turno === "DIURNO" ? "Diurno" : rdo.turno === "NOTURNO" ? "Noturno" : "Integral"}
              · Elaborado por <span className="font-medium text-slate-600">{rdo.elaborador.nome}</span>
            </p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp + Imprimir — sempre visíveis */}
            <CopiarWhatsApp rdo={{
              numero: rdo.numero,
              data: rdo.data.toISOString(),
              turno: rdo.turno,
              status: rdo.status,
              observacaoGeral: rdo.observacaoGeral,
              obra: { nome: rdo.obra.nome },
              elaborador: { nome: rdo.elaborador.nome },
              clima: rdo.clima.map(c => ({ periodo: c.periodo, condicao: c.condicao, temperatura: c.temperatura })),
              maoDeObra: rdo.maoDeObra.map(m => ({
                funcao: m.funcao, funcaoDescricao: m.funcaoDescricao, tipo: m.tipo,
                quantidade: m.quantidade, horasTrabalhadas: m.horasTrabalhadas,
                horasExtras: m.horasExtras, empresa: m.empresa,
              })),
              atividades: rdo.atividades.map(a => ({
                descricao: a.descricao, frente: a.frente,
                quantidadeRealizada: a.quantidadeRealizada,
                unidade: a.unidade, percentualAvancoDia: a.percentualAvancoDia,
              })),
              ocorrencias: rdo.ocorrencias.map(o => ({
                tipo: o.tipo, descricao: o.descricao, gravidade: o.gravidade,
              })),
            }} />

            <Link
              href={`/rdos/${rdo.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 transition-all"
            >
              <Printer className="w-4 h-4" /> Imprimir / PDF
            </Link>

            {/* Aprovar / Rejeitar — só quando cabível */}
            {canApprove && (
              <>
                <form action={rejeitar} className="flex items-center gap-2">
                  <input
                    name="motivoRejeicao"
                    className="input text-sm py-2 w-48"
                    placeholder="Motivo da rejeição…"
                  />
                  <button type="submit"
                    className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </button>
                </form>
                <form action={aprovar}>
                  <button type="submit" className="btn-primary">
                    <CheckCircle className="w-4 h-4" /> Aprovar RDO
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Motivo rejeição */}
        {rdo.status === "REJEITADO" && rdo.motivoRejeicao && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <span className="font-bold">Motivo da rejeição:</span> {rdo.motivoRejeicao}
          </div>
        )}
        {rdo.aprovador && rdo.status === "APROVADO" && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
            <span className="font-bold">Aprovado por</span> {rdo.aprovador.nome}
            {rdo.aprovador.cargo && ` — ${rdo.aprovador.cargo}`}
          </div>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Horas-Homem", valor: totalHH.toFixed(0) + " h", color: "#E8500D" },
          { label: "Efetivo",     valor: rdo.maoDeObra.reduce((a, m) => a + m.quantidade, 0) + " pessoas", color: "#7C3AED" },
          { label: "Atividades",  valor: rdo.atividades.length.toString(), color: "#0EA5E9" },
          { label: "Ocorrências", valor: rdo.ocorrencias.length.toString(), color: rdo.ocorrencias.length > 0 ? "#DC2626" : "#22C55E" },
        ].map(({ label, valor, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center"
            style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-xl font-black tabular-nums" style={{ color }}>{valor}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Clima */}
      {rdo.clima.length > 0 && (
        <Section icon={CloudSun} title="Condições Climáticas">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rdo.clima.map((c) => {
              const Icon = CONDICAO_ICON[c.condicao] ?? Sun;
              return (
                <div key={c.id} className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white shrink-0">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{PERIODO_LABEL[c.periodo]}</p>
                    <p className="font-semibold text-slate-700 text-sm mt-0.5">{CONDICAO_LABEL[c.condicao] ?? c.condicao}</p>
                    {c.temperatura != null && (
                      <p className="text-xs text-slate-400 mt-0.5">{c.temperatura}°C{c.umidade != null ? ` · ${c.umidade}% UR` : ""}</p>
                    )}
                    {c.observacao && <p className="text-xs text-slate-400 mt-1 italic">{c.observacao}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Mão de obra */}
      {rdo.maoDeObra.length > 0 && (
        <Section icon={Users} title="Mão de Obra">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="text-left py-2">Função</th>
                <th className="text-left py-2">Tipo</th>
                <th className="text-left py-2">Empresa</th>
                <th className="text-center py-2">Qtd</th>
                <th className="text-center py-2">HH</th>
                <th className="text-center py-2">Extras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rdo.maoDeObra.map((m) => (
                <tr key={m.id} className="text-slate-600">
                  <td className="py-2.5 font-medium">{m.funcaoDescricao ?? m.funcao.replace(/_/g, " ")}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.tipo === "PROPRIO" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                      {m.tipo === "PROPRIO" ? "Próprio" : "Terceirizado"}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs text-slate-400">{m.empresa ?? "—"}</td>
                  <td className="py-2.5 text-center font-bold">{m.quantidade}</td>
                  <td className="py-2.5 text-center tabular-nums">{m.horasTrabalhadas}h</td>
                  <td className="py-2.5 text-center tabular-nums text-amber-600">{m.horasExtras > 0 ? `+${m.horasExtras}h` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Equipamentos */}
      {rdo.equipamentos.length > 0 && (
        <Section icon={Wrench} title="Equipamentos">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="text-left py-2">Equipamento</th>
                <th className="text-center py-2">Qtd</th>
                <th className="text-center py-2">Operando</th>
                <th className="text-center py-2">Parado</th>
                <th className="text-left py-2">Motivo parada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rdo.equipamentos.map((e) => (
                <tr key={e.id} className="text-slate-600">
                  <td className="py-2.5 font-medium">{e.nome}{e.modelo ? <span className="text-slate-400 font-normal ml-1 text-xs">{e.modelo}</span> : ""}</td>
                  <td className="py-2.5 text-center">{e.quantidade}</td>
                  <td className="py-2.5 text-center tabular-nums text-green-600 font-medium">{e.horasOperadas}h</td>
                  <td className="py-2.5 text-center tabular-nums text-red-500">{e.horasParadas > 0 ? `${e.horasParadas}h` : "—"}</td>
                  <td className="py-2.5 text-xs text-slate-400">{e.motivoParada ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Atividades */}
      {rdo.atividades.length > 0 && (
        <Section icon={CheckSquare} title="Atividades Executadas">
          <div className="space-y-2">
            {rdo.atividades.map((a) => (
              <div key={a.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {a.atividadePlanejada?.wbs && (
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{a.atividadePlanejada.wbs}</span>
                    )}
                    <p className="font-medium text-slate-700 text-sm truncate">{a.descricao}</p>
                  </div>
                  {a.frente && <p className="text-xs text-slate-400 mt-0.5">{a.frente}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color: "#E8500D" }}>
                    {a.percentualAvancoDia.toFixed(1)}%
                  </p>
                  {a.quantidadeRealizada != null && (
                    <p className="text-[10px] text-slate-400">{a.quantidadeRealizada} {a.unidade}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Materiais */}
      {rdo.materiais.length > 0 && (
        <Section icon={Package} title="Materiais Recebidos">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="text-left py-2">Material</th>
                <th className="text-center py-2">Quantidade</th>
                <th className="text-left py-2">Fornecedor</th>
                <th className="text-left py-2">NF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rdo.materiais.map((m) => (
                <tr key={m.id} className="text-slate-600">
                  <td className="py-2.5 font-medium">{m.descricao}</td>
                  <td className="py-2.5 text-center tabular-nums">{m.quantidade} {m.unidade}</td>
                  <td className="py-2.5 text-xs text-slate-400">{m.fornecedor ?? "—"}</td>
                  <td className="py-2.5 text-xs text-slate-400 font-mono">{m.notaFiscal ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Ocorrências */}
      {rdo.ocorrencias.length > 0 && (
        <Section icon={AlertTriangle} title="Ocorrências / SMS">
          <div className="space-y-3">
            {rdo.ocorrencias.map((oc) => (
              <div key={oc.id} className="rounded-xl border p-4 space-y-2"
                style={{ borderColor: oc.gravidade === "CRITICA" ? "#FCA5A5" : oc.gravidade === "ALTA" ? "#FDBA74" : "#E2E8F0" }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-800 text-sm">{oc.tipo.replace(/_/g, " ")}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${GRAVIDADE_STYLE[oc.gravidade]}`}>
                    {oc.gravidade}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{oc.descricao}</p>
                {oc.impacto && <p className="text-xs text-slate-500"><span className="font-semibold">Impacto:</span> {oc.impacto}</p>}
                {oc.acaoImediata && <p className="text-xs text-slate-500"><span className="font-semibold">Ação imediata:</span> {oc.acaoImediata}</p>}
                {oc.responsavel && <p className="text-xs text-slate-400">Responsável: {oc.responsavel}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Observação geral */}
      {rdo.observacaoGeral && (
        <Section icon={FileText} title="Observações Gerais">
          <p className="text-sm text-slate-600 leading-relaxed">{rdo.observacaoGeral}</p>
        </Section>
      )}

      <div className="pb-6">
        <Link href={`/obras/${rdo.obra.id}/rdos`} className="btn-secondary text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar para lista de RDOs
        </Link>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", background: "rgba(0,0,0,0.015)" }}>
        <Icon className="w-4 h-4 text-slate-400" />
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
