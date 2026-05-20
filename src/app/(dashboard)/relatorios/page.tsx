import { Metadata } from "next";
import { BarChart2, FileText, Download, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Relatórios — RDO Enterprise" };

const RELATORIOS_PREVISTOS = [
  { icon: FileText,   titulo: "Relatório Mensal de Obra",      desc: "PDF com resumo de HH, atividades e ocorrências do mês",  status: "Em breve" },
  { icon: BarChart2,  titulo: "Curva S Consolidada",           desc: "Exportar gráfico de avanço físico em Excel ou PDF",        status: "Em breve" },
  { icon: TrendingUp, titulo: "Histograma de Efetivo",         desc: "Relatório de mão de obra por período e categoria",         status: "Em breve" },
  { icon: Download,   titulo: "Exportação de RDOs",            desc: "Exportar todos os RDOs da obra em formato Excel",          status: "Em breve" },
];

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
        <p className="text-sm text-slate-500 mt-0.5">Exportação e relatórios gerenciais</p>
      </div>

      {/* Banner "em breve" */}
      <div className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: "#1E1E1E", border: "1px solid #2A2A2A" }}>
        <div className="p-3 rounded-xl shrink-0" style={{ background: "rgba(232,80,13,0.15)", border: "1px solid rgba(232,80,13,0.25)" }}>
          <BarChart2 className="w-6 h-6" style={{ color: "#E8500D" }} />
        </div>
        <div>
          <p className="font-bold text-white">Módulo de relatórios em desenvolvimento</p>
          <p className="text-sm text-slate-400 mt-0.5">
            Exportação em PDF e Excel disponível na <span style={{ color: "#E8500D" }} className="font-semibold">versão de produção</span> com Supabase e Vercel.
          </p>
        </div>
      </div>

      {/* Preview dos relatórios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RELATORIOS_PREVISTOS.map(({ icon: Icon, titulo, desc, status }) => (
          <div key={titulo} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 opacity-60">
            <div className="p-2.5 rounded-xl shrink-0" style={{ background: "#FFF7F4", border: "1px solid #FDDCCC" }}>
              <Icon className="w-5 h-5" style={{ color: "#E8500D" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-700 text-sm">{titulo}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-400 shrink-0 mt-0.5">
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
