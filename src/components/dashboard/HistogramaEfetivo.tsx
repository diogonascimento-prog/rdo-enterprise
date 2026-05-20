"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatarData } from "@/lib/utils";
import type { DadoHistograma } from "@/types";

// ─── Tooltip customizado ─────────────────────────────────────────────────────
function TooltipCustom({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.fill }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value.toFixed(1)} HH</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex justify-between text-xs text-slate-500">
        <span>Total</span>
        <span className="font-bold text-slate-700">
          {payload.reduce((a: number, p: any) => a + p.value, 0).toFixed(1)} HH
        </span>
      </div>
    </div>
  );
}

// ─── Dados mock — 7 dias ─────────────────────────────────────────────────────
export const MOCK_HISTOGRAMA: DadoHistograma[] = [
  { data: "2024-06-09", hhProprio: 120, hhTerceiro: 64,  hhTotal: 184 },
  { data: "2024-06-10", hhProprio: 136, hhTerceiro: 72,  hhTotal: 208 },
  { data: "2024-06-11", hhProprio: 112, hhTerceiro: 56,  hhTotal: 168 },
  { data: "2024-06-12", hhProprio:  40, hhTerceiro: 16,  hhTotal:  56 }, // chuva
  { data: "2024-06-13", hhProprio: 144, hhTerceiro: 88,  hhTotal: 232 },
  { data: "2024-06-14", hhProprio: 152, hhTerceiro: 96,  hhTotal: 248 },
  { data: "2024-06-15", hhProprio: 128, hhTerceiro: 80,  hhTotal: 208 },
];

// ─── Componente ──────────────────────────────────────────────────────────────
interface HistogramaEfetivoProps {
  dados?: DadoHistograma[];
  mediaPrevista?: number; // linha de referência (meta HH/dia)
  titulo?: string;
}

export function HistogramaEfetivo({
  dados = MOCK_HISTOGRAMA,
  mediaPrevista,
  titulo = "Histograma de Mão de Obra (HH/dia)",
}: HistogramaEfetivoProps) {
  const dadosFormatados = dados.map((d) => ({
    ...d,
    dataLabel: formatarData(d.data, "dd/MM"),
  }));

  const hhMedio = dados.reduce((acc, d) => acc + d.hhTotal, 0) / dados.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-bold text-slate-800 text-base">{titulo}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            HH médio no período:{" "}
            <strong className="text-slate-700">{hhMedio.toFixed(0)} HH/dia</strong>
          </p>
        </div>

        {/* Legenda manual */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#E8500D" }} />
            <span className="text-slate-600">Próprio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#F5A878" }} />
            <span className="text-slate-600">Terceirizado</span>
          </div>
          {mediaPrevista && (
            <div className="flex items-center gap-1.5">
              <span className="w-5 border-t-2 border-dashed border-orange-500 inline-block" />
              <span className="text-slate-600">Meta</span>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={dadosFormatados}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
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
            tickFormatter={(v) => `${v}h`}
            width={40}
          />
          <Tooltip content={<TooltipCustom />} cursor={{ fill: "#f8fafc" }} />

          {/* Linha de meta */}
          {mediaPrevista && (
            <ReferenceLine
              y={mediaPrevista}
              stroke="#f97316"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{
                value: `Meta: ${mediaPrevista}HH`,
                position: "insideTopRight",
                fontSize: 11,
                fill: "#f97316",
              }}
            />
          )}

          <Bar dataKey="hhProprio"   name="Próprio"      stackId="hh" fill="#E8500D" radius={[0, 0, 0, 0]} />
          <Bar dataKey="hhTerceiro"  name="Terceirizado" stackId="hh" fill="#F5A878" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
