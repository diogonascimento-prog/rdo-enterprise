"use client";
import { useState } from "react";
import { Download, FileText, BarChart2, TrendingUp, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";

interface Obra { id: string; nome: string; codigo: string; }
interface Props { obras: Obra[]; }

export function RelatoriosClient({ obras }: Props) {
  const [obraId, setObraId] = useState(obras[0]?.id ?? "");
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function exportar(tipo: string) {
    if (!obraId) return;
    setLoading(tipo); setOk(null);
    try {
      const params = new URLSearchParams({ obraId, dataInicio, dataFim, tipo });
      const res = await fetch(`/api/relatorios/export?${params}`);
      if (!res.ok) throw new Error("Erro ao gerar relatório");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const obra = obras.find(o => o.id === obraId);
      a.download = `RDO_${obra?.codigo ?? "relatorio"}_${dataInicio}_${dataFim}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setOk(tipo);
      setTimeout(() => setOk(null), 3000);
    } catch (e) { alert("Erro ao exportar. Tente novamente."); }
    finally { setLoading(null); }
  }

  const RELATORIOS = [
    {
      id: "rdos",
      icon: FileText,
      titulo: "Exportar RDOs — Excel",
      desc: "Todos os RDOs do período com mão de obra, atividades e ocorrências",
      color: "#16A34A",
      bg: "#F0FDF4",
      border: "#BBF7D0",
    },
    {
      id: "atividades",
      icon: BarChart2,
      titulo: "Avanço Físico — Excel",
      desc: "Progresso por atividade e frente de serviço no período",
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    {
      id: "maoDeObra",
      icon: TrendingUp,
      titulo: "Histograma de Efetivo — Excel",
      desc: "Quantitativo de mão de obra por dia, função e tipo",
      color: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    },
    {
      id: "ocorrencias",
      icon: FileSpreadsheet,
      titulo: "Registro de Ocorrências — Excel",
      desc: "Todas as ocorrências/SMS registradas no período com gravidade e ações",
      color: "#E8500D",
      bg: "#FFF7F4",
      border: "#FDDCCC",
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 rounded-full bg-orange-gradient" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Relatórios</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Exportação de Dados</h1>
        <p className="text-sm text-slate-400 mt-1">Exporte relatórios em Excel por obra e período</p>
      </div>

      {/* Filtros */}
      <div className="card p-5">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Filtros de exportação</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Obra</label>
            <select value={obraId} onChange={e => setObraId(e.target.value)} className="input">
              {obras.map(o => <option key={o.id} value={o.id}>{o.codigo} — {o.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Data início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Data fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="input" />
          </div>
        </div>
      </div>

      {/* Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RELATORIOS.map(({ id, icon: Icon, titulo, desc, color, bg, border }) => (
          <div key={id} className="card p-5 flex items-start gap-4 card-hover">
            <div className="p-3 rounded-xl shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm">{titulo}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
            <button
              onClick={() => exportar(id)}
              disabled={loading === id || !obraId}
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
              style={{ background: ok === id ? "#F0FDF4" : bg, color: ok === id ? "#16A34A" : color, border: `1.5px solid ${ok === id ? "#BBF7D0" : border}` }}
            >
              {loading === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               ok === id ? <CheckCircle className="w-3.5 h-3.5" /> :
               <Download className="w-3.5 h-3.5" />}
              {loading === id ? "Gerando…" : ok === id ? "Baixado!" : "Exportar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
