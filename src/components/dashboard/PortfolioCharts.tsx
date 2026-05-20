"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface ObraChart { nome: string; rdos: number; status: string }
interface StatusDist { name: string; value: number; fill: string }
interface Props { obras: ObraChart[]; statusDist: StatusDist[] }

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-premium"
      style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
      <p className="text-xs font-bold text-slate-700 mb-1">{label}</p>
      <p className="text-lg font-black tabular-nums"
        style={{ color: "#E8500D" }}>
        {payload[0].value} <span className="text-xs font-medium text-slate-400">RDOs</span>
      </p>
    </div>
  );
};

const CustomTooltipPie = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-premium"
      style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
      <p className="text-xs font-bold text-slate-700 mb-1">{payload[0].name}</p>
      <p className="text-lg font-black tabular-nums" style={{ color: payload[0].payload.fill }}>
        {payload[0].value} <span className="text-xs font-medium text-slate-400">obra{payload[0].value !== 1 ? "s" : ""}</span>
      </p>
    </div>
  );
};

export function PortfolioCharts({ obras, statusDist }: Props) {
  if (obras.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Bar chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        }}>
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 className="font-bold text-slate-800 text-sm">RDOs por Obra</h3>
          <p className="text-xs text-slate-400 mt-0.5">Total de relatórios registrados em cada projeto</p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={obras} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis
                dataKey="nome"
                tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "rgba(232,80,13,0.04)", radius: 8 }} />
              <Bar dataKey="rdos" name="RDOs" radius={[6, 6, 0, 0]}>
                {obras.map((entry) => (
                  <Cell
                    key={entry.nome}
                    fill={
                      entry.status === "EM_ANDAMENTO" ? "url(#barGradientOrange)" :
                      entry.status === "CONCLUIDA"    ? "url(#barGradientGreen)"  :
                      entry.status === "PARALISADA"   ? "url(#barGradientAmber)"  :
                      "url(#barGradientSlate)"
                    }
                  />
                ))}
                <defs>
                  <linearGradient id="barGradientOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#E8500D" />
                  </linearGradient>
                  <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#16A34A" />
                  </linearGradient>
                  <linearGradient id="barGradientAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="barGradientSlate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        }}>
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 className="font-bold text-slate-800 text-sm">Status do Portfólio</h3>
          <p className="text-xs text-slate-400 mt-0.5">Distribuição por situação atual</p>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusDist}
                cx="50%"
                cy="45%"
                innerRadius={52}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {statusDist.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={7}
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{value}</span>
                )}
              />
              <Tooltip content={<CustomTooltipPie />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
