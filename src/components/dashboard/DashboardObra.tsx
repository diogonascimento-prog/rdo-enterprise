"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart2, CalendarDays, ClipboardList, TrendingUp,
  MessageCircle, Check, ChevronDown, ChevronRight, Users,
  Clock, AlertTriangle, CheckCircle, Activity,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface AtividadeFrente {
  id: string;
  descricao: string;
  frente: string | null;
  wbs: string | null;
  unidade: string | null;
  quantidadeTotal: number | null;
  dataInicioPrev: string;
  dataFimPrev: string;
  executado: number;   // quantidade realizada acumulada
  percentual: number;  // % do avanço acumulado
}

export interface RdoDiario {
  id: string;
  numero: number;
  data: string;
  turno: string;
  status: string;
  elaborador: { nome: string };
  atividades: Array<{
    descricao: string;
    frente: string | null;
    quantidadeRealizada: number | null;
    unidade: string | null;
    percentualAvancoDia: number | null;
  }>;
  maoDeObra: Array<{
    funcao: string; funcaoDescricao: string | null; tipo: string;
    quantidade: number; horasTrabalhadas: number; horasExtras: number; empresa: string | null;
  }>;
  clima: Array<{ periodo: string; condicao: string; temperatura: number | null }>;
  ocorrencias: Array<{ tipo: string; descricao: string; gravidade: string }>;
  observacaoGeral: string | null;
}

export interface DashboardObraProps {
  obraId: string;
  obraInfo: { nome: string; codigo: string };
  frentesResumo: Array<{
    frente: string;
    total: number;
    andamento: number;
    planejadas: number;
    atrasadas: number;
  }>;
  rdoRecente: RdoDiario | null;
  semana: Array<{ data: string; totalPessoas: number; totalHH: number; atividades: number }>;
  children: React.ReactNode; // tab "Visão Geral" — gráficos server-side
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CLIMA_EMOJI: Record<string, string> = {
  BOM: "☀️", NUBLADO: "⛅", CHUVA_LEVE: "🌦️", CHUVA_FORTE: "⛈️",
  IMPRATICAVEL: "🚫", VENTANIA: "💨", NEBLINA: "🌫️",
};
const CLIMA_LABEL: Record<string, string> = {
  BOM: "Bom", NUBLADO: "Nublado", CHUVA_LEVE: "Chuva leve",
  CHUVA_FORTE: "Chuva forte", IMPRATICAVEL: "Impraticável", VENTANIA: "Ventania", NEBLINA: "Neblina",
};
const PERIODO_LABEL: Record<string, string> = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };
const TURNO_LABEL: Record<string, string> = { DIURNO: "Diurno", NOTURNO: "Noturno", INTEGRAL: "Integral" };
const STATUS_WA: Record<string, string> = {
  APROVADO: "Aprovado ✓", PENDENTE_APROVACAO: "Aguard. aprovação", RASCUNHO: "Rascunho", REJEITADO: "Rejeitado",
};

const FRENTE_CORES: Record<string, string> = {
  "CIVIL": "#3b82f6", "EMEC": "#8b5cf6", "ELÉTRICA": "#f59e0b",
  "COMISSIONAMENTO": "#10b981", "ENERGIZAÇÃO": "#ef4444",
};
function corFrente(f: string) {
  const upper = f.toUpperCase();
  for (const [k, v] of Object.entries(FRENTE_CORES)) if (upper.includes(k)) return v;
  return "#64748b";
}

function diasAtraso(dataFim: string) {
  const diff = (new Date().getTime() - new Date(dataFim).getTime()) / 86400000;
  return Math.floor(diff);
}

// ─── WhatsApp generator para RDO diário ──────────────────────────────────────

function gerarWhatsAppDiario(rdo: RdoDiario, nomeProjeto: string) {
  const data = new Date(rdo.data + "T12:00:00");
  const diaFmt = data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  const totalPessoas = rdo.maoDeObra.reduce((a, m) => a + m.quantidade, 0);
  const totalHH = rdo.maoDeObra.reduce((a, m) => a + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0);

  // agrupar atividades por frente
  const porFrente: Record<string, typeof rdo.atividades> = {};
  rdo.atividades.forEach(a => {
    const f = a.frente ?? "GERAL";
    (porFrente[f] = porFrente[f] ?? []).push(a);
  });

  const L: string[] = [];
  L.push(`📋 *RDO #${String(rdo.numero).padStart(3, "0")} — ${nomeProjeto}*`);
  L.push(`📅 ${diaFmt}`);
  L.push(`🕐 Turno: ${TURNO_LABEL[rdo.turno] ?? rdo.turno}  |  Elaborado: ${rdo.elaborador.nome}`);
  L.push(``);
  L.push(`▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);
  L.push(``);

  if (rdo.clima.length > 0) {
    L.push(`🌤️ *CLIMA*`);
    rdo.clima.forEach(c => {
      const emoji = CLIMA_EMOJI[c.condicao] ?? "🌡️";
      const temp = c.temperatura != null ? `, ${c.temperatura}°C` : "";
      L.push(`• ${PERIODO_LABEL[c.periodo] ?? c.periodo}: ${emoji} ${CLIMA_LABEL[c.condicao] ?? c.condicao}${temp}`);
    });
    L.push(``);
  }

  if (rdo.maoDeObra.length > 0) {
    L.push(`👷 *MÃO DE OBRA — ${totalPessoas} pessoas | ${totalHH.toFixed(0)} HH*`);
    rdo.maoDeObra.forEach(m => {
      const extra = m.horasExtras > 0 ? ` +${m.horasExtras}h extra` : "";
      const empresa = m.tipo === "TERCEIRIZADO" && m.empresa ? ` — ${m.empresa}` : "";
      L.push(`• ${m.funcaoDescricao || m.funcao}: ${m.quantidade} × ${m.horasTrabalhadas}h${extra}${empresa}`);
    });
    L.push(``);
  }

  if (rdo.atividades.length > 0) {
    L.push(`🔨 *ATIVIDADES EXECUTADAS*`);
    Object.entries(porFrente).forEach(([frente, ativs]) => {
      L.push(``);
      L.push(`*${frente}*`);
      ativs.forEach((a, i) => {
        L.push(`${i + 1}) ${a.descricao}`);
        if (a.quantidadeRealizada != null && a.unidade) {
          const av = a.percentualAvancoDia != null ? ` | Avanço: ${a.percentualAvancoDia}%` : "";
          L.push(`   📦 ${a.quantidadeRealizada} ${a.unidade}${av}`);
        }
      });
    });
    L.push(``);
  }

  if (rdo.ocorrencias.length > 0) {
    L.push(`⚠️ *OCORRÊNCIAS (${rdo.ocorrencias.length})*`);
    rdo.ocorrencias.forEach(o => L.push(`• [${o.gravidade}] ${o.descricao}`));
    L.push(``);
  }

  if (rdo.observacaoGeral?.trim()) {
    L.push(`📝 *OBSERVAÇÕES*`);
    L.push(rdo.observacaoGeral.trim());
    L.push(``);
  }

  L.push(`▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);
  L.push(`Status: *${STATUS_WA[rdo.status] ?? rdo.status}*`);
  L.push(`_RDO Enterprise — ENGETECNICA_`);
  return L.join("\n");
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Aba = "geral" | "frentes" | "diario" | "semana";

export function DashboardObra({
  obraId, obraInfo, frentesResumo, rdoRecente, semana, children,
}: DashboardObraProps) {
  const [aba, setAba] = useState<Aba>("geral");
  const [frentesExpandidas, setFrentesExpandidas] = useState<Set<string>>(new Set());
  const [waCopiado, setWaCopiado] = useState(false);

  const totalAtiv = frentesResumo.reduce((a, f) => a + f.total, 0);
  const totalAndamento = frentesResumo.reduce((a, f) => a + f.andamento, 0);
  const totalPlanejadas = frentesResumo.reduce((a, f) => a + f.planejadas, 0);
  const totalAtrasadas = frentesResumo.reduce((a, f) => a + f.atrasadas, 0);

  const ABAS: { id: Aba; label: string; icon: React.ElementType }[] = [
    { id: "geral",   label: "Visão Geral",  icon: BarChart2     },
    { id: "frentes", label: "Frentes",      icon: ClipboardList },
    { id: "diario",  label: "Diário",       icon: CalendarDays  },
    { id: "semana",  label: "Por Semana",   icon: TrendingUp    },
  ];

  async function copiarWhatsApp() {
    if (!rdoRecente) return;
    const texto = gerarWhatsAppDiario(rdoRecente, obraInfo.nome);
    try { await navigator.clipboard.writeText(texto); }
    catch { const ta = document.createElement("textarea"); ta.value = texto; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
    setWaCopiado(true);
    setTimeout(() => setWaCopiado(false), 3000);
  }

  function toggleFrente(f: string) {
    setFrentesExpandidas(prev => {
      const s = new Set(prev);
      s.has(f) ? s.delete(f) : s.add(f);
      return s;
    });
  }

  return (
    <div className="space-y-4">

      {/* ── KPI strip (igual ao do chefe) ───────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "TOTAL", valor: totalAtiv, sub: `${frentesResumo.length} frentes`, color: "#1e293b", bg: "bg-slate-800 text-white" },
          { label: "EM ANDAMENTO", valor: totalAndamento, sub: "hoje", color: "#16a34a", bg: "bg-white text-green-600", border: "border-l-4 border-green-500" },
          { label: "PLANEJADAS", valor: totalPlanejadas, sub: "aguardando", color: "#2563eb", bg: "bg-white text-blue-600", border: "border-l-4 border-blue-500" },
          { label: "ATRASADAS", valor: totalAtrasadas, sub: "requer ação", color: "#dc2626", bg: `bg-white ${totalAtrasadas > 0 ? "text-red-600" : "text-slate-400"}`, border: `border-l-4 ${totalAtrasadas > 0 ? "border-red-500" : "border-slate-200"}` },
          { label: "RDOs APROVADOS", valor: semana.length, sub: "últimos 7 dias", color: "#E8500D", bg: "bg-white text-orange-600", border: "border-l-4 border-orange-400" },
        ].map(({ label, valor, sub, bg, border }) => (
          <div key={label} className={`rounded-xl px-4 py-3 shadow-sm ${bg} ${border ?? ""}`}
            style={{ border: border ? undefined : "1px solid rgba(0,0,0,0.06)" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</div>
            <div className="text-3xl font-black leading-none mt-0.5">{valor}</div>
            <div className="text-[11px] opacity-60 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Abas ───────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm overflow-x-auto">
        {ABAS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setAba(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              aba === id
                ? "bg-slate-900 text-white shadow"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Aba: Visão Geral ───────────────────────────────── */}
      {aba === "geral" && <div>{children}</div>}

      {/* ── Aba: Frentes ──────────────────────────────────── */}
      {aba === "frentes" && (
        <div>
          <p className="text-xs text-slate-400 mb-3">Resumo por frente — clique para expandir as atividades</p>
          {frentesResumo.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma atividade planejada cadastrada.</p>
              <p className="text-xs mt-1">Use "Importar → Cronograma" para importar o cronograma da obra.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {frentesResumo.map(f => {
                const cor = corFrente(f.frente);
                const expandida = frentesExpandidas.has(f.frente);
                return (
                  <div key={f.frente} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <button className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      onClick={() => toggleFrente(f.frente)}>
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-10 rounded-full" style={{ background: cor }} />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{f.frente}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            <span className="text-green-600 font-bold">{f.andamento} andamento</span>
                            {" · "}
                            <span className="text-blue-600">{f.planejadas} plan.</span>
                            {f.atrasadas > 0 && <><span className="text-red-500 font-bold"> · {f.atrasadas} atras.</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: cor + "20", color: cor }}>
                          {f.total} ativ.
                        </span>
                        {expandida ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {expandida && (
                      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-black text-green-600">{f.andamento}</div>
                            <div className="text-[10px] text-slate-400 uppercase">Andamento</div>
                          </div>
                          <div>
                            <div className="text-lg font-black text-blue-500">{f.planejadas}</div>
                            <div className="text-[10px] text-slate-400 uppercase">Planejadas</div>
                          </div>
                          <div>
                            <div className={`text-lg font-black ${f.atrasadas > 0 ? "text-red-500" : "text-slate-300"}`}>{f.atrasadas}</div>
                            <div className="text-[10px] text-slate-400 uppercase">Atrasadas</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Aba: Diário ────────────────────────────────────── */}
      {aba === "diario" && (
        <div className="space-y-4">
          {!rdoRecente ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum RDO registrado ainda.</p>
              <Link href={`/obras/${obraId}/rdos/novo`}
                className="inline-block mt-3 text-xs font-bold text-orange-600 hover:underline">
                + Criar primeiro RDO →
              </Link>
            </div>
          ) : (
            <>
              {/* Header da aba Diário */}
              <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                    RDO Enterprise — Relatório Diário de Obra
                  </div>
                  <div className="text-lg font-black">
                    ATIVIDADES EXECUTADAS —{" "}
                    <span className="text-orange-400">
                      {new Date(rdoRecente.data + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
                      }).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    RDO #{String(rdoRecente.numero).padStart(3, "0")} · Turno {TURNO_LABEL[rdoRecente.turno] ?? rdoRecente.turno} · {rdoRecente.elaborador.nome}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/obras/${obraId}/rdos/${rdoRecente.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                    Ver RDO completo →
                  </Link>
                  <button onClick={copiarWhatsApp}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                      waCopiado ? "bg-green-500 text-white" : "bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30"
                    }`}>
                    {waCopiado ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><MessageCircle className="w-3.5 h-3.5" /> Copiar para WhatsApp</>}
                  </button>
                </div>
              </div>

              {/* KPIs do dia */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: "Pessoas", valor: rdoRecente.maoDeObra.reduce((a, m) => a + m.quantidade, 0), color: "#7c3aed" },
                  { icon: Clock, label: "Horas-Homem", valor: rdoRecente.maoDeObra.reduce((a, m) => a + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0).toFixed(0) + " h", color: "#E8500D" },
                  { icon: Activity, label: "Atividades", valor: rdoRecente.atividades.length, color: "#0ea5e9" },
                  { icon: AlertTriangle, label: "Ocorrências", valor: rdoRecente.ocorrencias.length, color: rdoRecente.ocorrencias.length > 0 ? "#dc2626" : "#22c55e" },
                ].map(({ icon: Icon, label, valor, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
                    <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
                    <div className="text-2xl font-black" style={{ color }}>{valor}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Atividades por frente */}
              {(() => {
                const porFrente: Record<string, typeof rdoRecente.atividades> = {};
                rdoRecente.atividades.forEach(a => {
                  const f = a.frente ?? "GERAL";
                  (porFrente[f] = porFrente[f] ?? []).push(a);
                });
                return Object.entries(porFrente).map(([frente, ativs]) => {
                  const cor = corFrente(frente);
                  return (
                    <div key={frente} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-50"
                        style={{ borderLeft: `4px solid ${cor}` }}>
                        <span className="font-black text-sm" style={{ color: cor }}>{frente}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: cor + "15", color: cor }}>{ativs.length} ativ.</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {ativs.map((a, i) => (
                          <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{a.descricao}</p>
                              {a.quantidadeRealizada != null && a.unidade && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  📦 {a.quantidadeRealizada} {a.unidade}
                                  {a.percentualAvancoDia != null && ` · Avanço: ${a.percentualAvancoDia}%`}
                                </p>
                              )}
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}

              {rdoRecente.atividades.length === 0 && (
                <div className="bg-white rounded-2xl p-6 text-center text-slate-400 border border-slate-100">
                  <p className="text-sm">Nenhuma atividade registrada neste RDO.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Aba: Por Semana ────────────────────────────────── */}
      {aba === "semana" && (
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Últimos 7 dias de campo</h3>
              <Link href={`/obras/${obraId}/rdos`}
                className="text-xs font-bold text-orange-500 hover:underline">Ver todos os RDOs →</Link>
            </div>
            {semana.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhum RDO nos últimos 7 dias.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 text-xs text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-semibold">Data</th>
                    <th className="text-center px-5 py-3 font-semibold">Pessoas</th>
                    <th className="text-center px-5 py-3 font-semibold">HH Total</th>
                    <th className="text-center px-5 py-3 font-semibold">Atividades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {semana.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR", {
                          weekday: "short", day: "2-digit", month: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-purple-600">{d.totalPessoas}</td>
                      <td className="px-5 py-3 text-center font-bold text-orange-600">{d.totalHH}h</td>
                      <td className="px-5 py-3 text-center font-bold text-sky-600">{d.atividades}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800 text-white text-xs font-bold">
                    <td className="px-5 py-2.5">TOTAL</td>
                    <td className="px-5 py-2.5 text-center">{semana.reduce((a, d) => a + d.totalPessoas, 0)}</td>
                    <td className="px-5 py-2.5 text-center">{semana.reduce((a, d) => a + d.totalHH, 0)}h</td>
                    <td className="px-5 py-2.5 text-center">{semana.reduce((a, d) => a + d.atividades, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
