"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from "recharts";
import { formatarData } from "@/lib/utils";
import type { DadoCurvaS } from "@/types";

// ─── Dados mock ───────────────────────────────────────────────────────────────
export const MOCK_CURVA_S: DadoCurvaS[] = [
  { data: "2024-05-01", avancoDia: 1.5, acumulado:  1.5, previsto:  2.0 },
  { data: "2024-05-08", avancoDia: 2.1, acumulado:  3.6, previsto:  5.0 },
  { data: "2024-05-15", avancoDia: 3.4, acumulado:  7.0, previsto:  9.0 },
  { data: "2024-05-22", avancoDia: 4.2, acumulado: 11.2, previsto: 14.0 },
  { data: "2024-05-29", avancoDia: 5.1, acumulado: 16.3, previsto: 20.0 },
  { data: "2024-06-05", avancoDia: 5.8, acumulado: 22.1, previsto: 27.0 },
  { data: "2024-06-12", avancoDia: 4.2, acumulado: 26.3, previsto: 34.0 }, // atraso chuva
  { data: "2024-06-15", avancoDia: 3.1, acumulado: 29.4, previsto: 37.0 },
];

function TooltipCustom({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const acum  = payload.find((p: any) => p.dataKey === "acumulado");
  const prev  = payload.find((p: any) => p.dataKey === "previsto");
  const desvio = acum && prev ? acum.value - prev.value : null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {acum && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "#E8500D" }} />
          <span className="text-slate-600">Realizado:</span>
          <span className="font-bold" style={{ color: "#E8500D" }}>{acum.value.toFixed(1)}%</span>
        </div>
      )}
      {prev && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
          <span className="text-slate-600">Previsto:</span>
          <span className="font-bold text-slate-700">{prev.value.toFixed(1)}%</span>
        </div>
      )}
      {desvio !== null && (
        <div className={`mt-1.5 pt-1.5 border-t border-slate-100 text-xs font-semibold ${desvio >= 0 ? "text-green-600" : "text-red-500"}`}>
          Desvio: {desvio >= 0 ? "+" : ""}{desvio.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

interface CurvaSProps {
  dados?: DadoCurvaS[];
}

export function CurvaS({ dados = MOCK_CURVA_S }: CurvaSProps) {
  const dadosFormatados = dados.map((d) => ({
    ...d,
    dataLabel: formatarData(d.data, "dd/MM"),
  }));

  const ultimo = dados[dados.length - 1];
  const desvioAtual = ultimo.previsto !== undefined
    ? (ultimo.acumulado - ultimo.previsto).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Curva S — Avanço Físico</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Progresso acumulado da obra (%)
          </p>
        </div>
        {desvioAtual !== null && (
          <div className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
            Number(desvioAtual) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            Desvio atual: {Number(desvioAtual) >= 0 ? "+" : ""}{desvioAtual}%
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={dadosFormatados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRealizado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#E8500D" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#E8500D" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="dataLabel"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            width={40}
          />
          <Tooltip content={<TooltipCustom />} />

          {/* Previsto */}
          <Line
            type="monotone"
            dataKey="previsto"
            name="Previsto"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Realizado com área */}
          <Area
            type="monotone"
            dataKey="acumulado"
            name="Realizado"
            stroke="#E8500D"
            strokeWidth={2.5}
            fill="url(#gradRealizado)"
            dot={{ fill: "#E8500D", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
