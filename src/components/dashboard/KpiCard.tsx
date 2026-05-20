import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: LucideIcon;
  cor?: "orange" | "green" | "red" | "blue" | "purple" | "dark";
  tendencia?: { valor: number; label: string };
}

const temas = {
  orange: {
    iconBg: "linear-gradient(135deg, #E8500D 0%, #F97316 100%)",
    iconShadow: "0 4px 12px rgba(232,80,13,0.35)",
    numColor: "#E8500D",
    numGradient: "linear-gradient(135deg, #E8500D 0%, #F97316 100%)",
    accent: "rgba(232,80,13,0.08)",
    accentBorder: "rgba(232,80,13,0.12)",
    topBar: "linear-gradient(90deg, #E8500D, #F97316)",
  },
  green: {
    iconBg: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
    iconShadow: "0 4px 12px rgba(22,163,74,0.35)",
    numColor: "#16A34A",
    numGradient: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
    accent: "rgba(22,163,74,0.06)",
    accentBorder: "rgba(22,163,74,0.10)",
    topBar: "linear-gradient(90deg, #16A34A, #22C55E)",
  },
  red: {
    iconBg: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
    iconShadow: "0 4px 12px rgba(220,38,38,0.35)",
    numColor: "#DC2626",
    numGradient: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
    accent: "rgba(220,38,38,0.06)",
    accentBorder: "rgba(220,38,38,0.10)",
    topBar: "linear-gradient(90deg, #DC2626, #EF4444)",
  },
  blue: {
    iconBg: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
    iconShadow: "0 4px 12px rgba(37,99,235,0.35)",
    numColor: "#2563EB",
    numGradient: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
    accent: "rgba(37,99,235,0.06)",
    accentBorder: "rgba(37,99,235,0.10)",
    topBar: "linear-gradient(90deg, #2563EB, #3B82F6)",
  },
  purple: {
    iconBg: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
    iconShadow: "0 4px 12px rgba(124,58,237,0.35)",
    numColor: "#7C3AED",
    numGradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
    accent: "rgba(124,58,237,0.06)",
    accentBorder: "rgba(124,58,237,0.10)",
    topBar: "linear-gradient(90deg, #7C3AED, #A855F7)",
  },
  dark: {
    iconBg: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
    iconShadow: "0 4px 12px rgba(30,41,59,0.35)",
    numColor: "#1E293B",
    numGradient: "linear-gradient(135deg, #1E293B 0%, #475569 100%)",
    accent: "rgba(30,41,59,0.04)",
    accentBorder: "rgba(30,41,59,0.08)",
    topBar: "linear-gradient(90deg, #1E293B, #475569)",
  },
};

export function KpiCard({ titulo, valor, subtitulo, icone: Icone, cor = "orange", tendencia }: KpiCardProps) {
  const t = temas[cor];
  return (
    <div className="card card-hover overflow-hidden group">
      {/* Top gradient bar */}
      <div className="h-[3px] w-full" style={{ background: t.topBar }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5 flex-1">
            {titulo}
          </p>
          <div className="shrink-0 p-2.5 rounded-xl"
            style={{ background: t.iconBg, boxShadow: t.iconShadow }}>
            <Icone className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Value */}
        <div>
          <p className="text-3xl font-black leading-none tabular-nums"
            style={{
              background: t.numGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            {valor}
          </p>
          {subtitulo && (
            <p className="text-xs text-slate-400 mt-2 font-medium">{subtitulo}</p>
          )}
        </div>

        {/* Trend */}
        {tendencia && (
          <div className={`flex items-center gap-1.5 text-xs font-bold mt-3 pt-3
            ${tendencia.valor >= 0 ? "text-green-600" : "text-red-500"}`}
            style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
            {tendencia.valor >= 0
              ? <TrendingUp className="w-3.5 h-3.5" />
              : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(tendencia.valor)}% {tendencia.label}
          </div>
        )}
      </div>
    </div>
  );
}
