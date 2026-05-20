"use client";

import { useState } from "react";
import { ImportarExcel } from "@/components/importar/ImportarExcel";
import { ImportarCronograma } from "@/components/importar/ImportarCronograma";
import { FileSpreadsheet, ListChecks } from "lucide-react";

const ABAS = [
  { id: "obras-usuarios", label: "Obras & Usuários", icon: FileSpreadsheet,
    desc: "Cadastro em massa via planilha modelo" },
  { id: "cronograma",     label: "Cronograma",       icon: ListChecks,
    desc: "Importar lista de tarefas / WBS" },
];

export default function ImportarPage() {
  const [aba, setAba] = useState<"obras-usuarios" | "cronograma">("obras-usuarios");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 rounded-full bg-orange-gradient" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistema</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Importar Dados</h1>
        <p className="text-sm text-slate-400 mt-1">Cadastre obras, usuários e cronogramas via planilha Excel</p>
      </div>

      {/* Abas */}
      <div className="flex gap-3">
        {ABAS.map(({ id, label, icon: Icon, desc }) => {
          const active = aba === id;
          return (
            <button
              key={id}
              onClick={() => setAba(id as typeof aba)}
              className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all
                ${active
                  ? "bg-white shadow-sm border-2 border-brand-orange"
                  : "bg-white/60 border border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
            >
              <div className={`p-2 rounded-xl shrink-0 transition-all ${active ? "bg-orange-50" : "bg-slate-50"}`}>
                <Icon className={`w-4 h-4 ${active ? "text-brand-orange" : "text-slate-400"}`} />
              </div>
              <div>
                <p className={`text-sm font-bold ${active ? "text-slate-900" : "text-slate-600"}`}>{label}</p>
                <p className={`text-xs ${active ? "text-slate-500" : "text-slate-400"}`}>{desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conteúdo */}
      {aba === "obras-usuarios" ? <ImportarExcel /> : <ImportarCronograma />}
    </div>
  );
}
