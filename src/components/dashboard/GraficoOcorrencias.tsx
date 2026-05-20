"use client";

import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const DADOS_MOCK = [
  { name: "Paralisação — Chuva",            value: 8,  color: "#2B2B2B" },
  { name: "Falta de material",              value: 5,  color: "#E8500D" },
  { name: "Incidente / Quase-acidente",     value: 3,  color: "#DC2626" },
  { name: "Problema de projeto",            value: 2,  color: "#F5A878" },
  { name: "Falta de equipamento",           value: 2,  color: "#C44008" },
  { name: "Visita de fiscalização",         value: 4,  color: "#94a3b8" },
];

function TooltipCustom({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{d.name}</p>
      <p className="text-slate-600">
        <strong style={{ color: d.payload.color }}>{d.value}</strong> ocorrências
      </p>
    </div>
  );
}

interface GraficoOcorrenciasProps {
  dados?: { name: string; value: number; color: string }[];
}

export function GraficoOcorrencias({ dados = DADOS_MOCK }: GraficoOcorrenciasProps) {
  const total = dados.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-base">Ocorrências por Categoria</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Total:{" "}
          <strong className="text-slate-700">{total} registros</strong> no período
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Donut */}
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={dados}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {dados.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<TooltipCustom />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legenda lateral */}
        <div className="flex-1 space-y-2">
          {dados.map((d) => (
            <div key={d.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-slate-600 truncate">{d.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-800">{d.value}</span>
                <span className="text-xs text-slate-400 w-9 text-right">
                  {((d.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
