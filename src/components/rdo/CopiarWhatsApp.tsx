"use client";
import { useState } from "react";
import { MessageCircle, Check } from "lucide-react";

export interface RdoParaWhatsApp {
  numero: number;
  data: string;
  turno: string;
  status: string;
  observacaoGeral: string | null;
  obra: { nome: string };
  elaborador: { nome: string };
  clima: Array<{ periodo: string; condicao: string; temperatura: number | null }>;
  maoDeObra: Array<{
    funcao: string; funcaoDescricao: string | null; tipo: string;
    quantidade: number; horasTrabalhadas: number; horasExtras: number; empresa: string | null;
  }>;
  atividades: Array<{
    descricao: string; frente: string | null;
    quantidadeRealizada: number | null; unidade: string | null; percentualAvancoDia: number | null;
  }>;
  ocorrencias: Array<{ tipo: string; descricao: string; gravidade: string }>;
}

const CLIMA_EMOJI: Record<string, string> = {
  BOM: "☀️", NUBLADO: "⛅", CHUVA_LEVE: "🌦️", CHUVA_FORTE: "⛈️",
  IMPRATICAVEL: "🚫", VENTANIA: "💨", NEBLINA: "🌫️",
};
const CLIMA_LABEL: Record<string, string> = {
  BOM: "Bom", NUBLADO: "Nublado", CHUVA_LEVE: "Chuva leve",
  CHUVA_FORTE: "Chuva forte", IMPRATICAVEL: "Impraticável",
  VENTANIA: "Ventania", NEBLINA: "Neblina",
};
const PERIODO_LABEL: Record<string, string> = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };
const TURNO_LABEL: Record<string, string> = { DIURNO: "Diurno", NOTURNO: "Noturno", INTEGRAL: "Integral" };
const STATUS_LABEL: Record<string, string> = {
  APROVADO: "Aprovado ✓", PENDENTE_APROVACAO: "Aguard. aprovação",
  RASCUNHO: "Rascunho", REJEITADO: "Rejeitado ✗",
};

function gerarTextoWhatsApp(rdo: RdoParaWhatsApp): string {
  const data = new Date(rdo.data + "T12:00:00");
  const diaFmt = data.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });
  const totalPessoas = rdo.maoDeObra.reduce((a, m) => a + m.quantidade, 0);
  const totalHH = rdo.maoDeObra.reduce(
    (a, m) => a + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0
  );

  const L: string[] = [];
  const add = (s: string) => L.push(s);

  add(`📋 *RDO #${String(rdo.numero).padStart(3, "0")} — ${rdo.obra.nome}*`);
  add(`📅 ${diaFmt}`);
  add(`🕐 Turno: ${TURNO_LABEL[rdo.turno] ?? rdo.turno}  |  Elaborado: ${rdo.elaborador.nome}`);
  add(``);
  add(`▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);
  add(``);

  if (rdo.clima.length > 0) {
    add(`🌤️ *CLIMA*`);
    rdo.clima.forEach((c) => {
      const emoji = CLIMA_EMOJI[c.condicao] ?? "🌡️";
      const temp = c.temperatura != null ? `, ${c.temperatura}°C` : "";
      add(`• ${PERIODO_LABEL[c.periodo] ?? c.periodo}: ${emoji} ${CLIMA_LABEL[c.condicao] ?? c.condicao}${temp}`);
    });
    add(``);
  }

  if (rdo.maoDeObra.length > 0) {
    add(`👷 *MÃO DE OBRA — ${totalPessoas} pessoas | ${totalHH.toFixed(0)} HH*`);
    rdo.maoDeObra.forEach((m) => {
      const extra = m.horasExtras > 0 ? ` +${m.horasExtras}h extra` : "";
      const empresa = m.tipo === "TERCEIRIZADO" && m.empresa ? ` — ${m.empresa}` : "";
      const nome = m.funcaoDescricao || m.funcao.replace(/_/g, " ");
      add(`• ${nome}: ${m.quantidade} × ${m.horasTrabalhadas}h${extra}${empresa}`);
    });
    add(``);
  }

  if (rdo.atividades.length > 0) {
    add(`🔨 *ATIVIDADES EXECUTADAS (${rdo.atividades.length})*`);
    rdo.atividades.forEach((a, i) => {
      const frente = a.frente ? ` [${a.frente}]` : "";
      add(`${i + 1}. ${a.descricao}${frente}`);
      if (a.quantidadeRealizada != null && a.unidade) {
        const av = a.percentualAvancoDia != null ? ` | Avanço: ${a.percentualAvancoDia}%` : "";
        add(`   📦 ${a.quantidadeRealizada} ${a.unidade}${av}`);
      }
    });
    add(``);
  }

  if (rdo.ocorrencias.length > 0) {
    add(`⚠️ *OCORRÊNCIAS (${rdo.ocorrencias.length})*`);
    rdo.ocorrencias.forEach((o) => {
      add(`• [${o.gravidade}] ${o.descricao}`);
    });
    add(``);
  }

  if (rdo.observacaoGeral?.trim()) {
    add(`📝 *OBSERVAÇÕES*`);
    add(rdo.observacaoGeral.trim());
    add(``);
  }

  add(`▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`);
  add(`Status: *${STATUS_LABEL[rdo.status] ?? rdo.status}*`);
  add(`_RDO Enterprise — ENGETECNICA_`);

  return L.join("\n");
}

export function CopiarWhatsApp({ rdo }: { rdo: RdoParaWhatsApp }) {
  const [estado, setEstado] = useState<"idle" | "copiado">("idle");

  async function copiar() {
    const texto = gerarTextoWhatsApp(rdo);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setEstado("copiado");
    setTimeout(() => setEstado("idle"), 3000);
  }

  return (
    <button
      onClick={copiar}
      className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border transition-all ${
        estado === "copiado"
          ? "bg-green-50 text-green-700 border-green-300"
          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 active:scale-95"
      }`}
    >
      {estado === "copiado" ? (
        <><Check className="w-4 h-4" /> Copiado!</>
      ) : (
        <><MessageCircle className="w-4 h-4" /> Copiar WhatsApp</>
      )}
    </button>
  );
}
