import { Metadata } from "next";
import { Settings, Database, FolderOpen, Lock, Tag } from "lucide-react";

export const metadata: Metadata = { title: "Configurações — RDO Enterprise" };

const INFO_SISTEMA = [
  { icon: Tag,        label: "Versão",                    valor: "0.1.0 — Validação interna"  },
  { icon: Database,   label: "Banco de dados",            valor: "SQLite (local)"              },
  { icon: FolderOpen, label: "Armazenamento de fotos",    valor: "/public/uploads/"            },
  { icon: Lock,       label: "Autenticação",              valor: "Credenciais locais"          },
];

const ROADMAP = [
  { fase: "Fase 1 — Atual",    desc: "SQLite + login local + RDO completo",              done: true  },
  { fase: "Fase 2 — Produção", desc: "Supabase (PostgreSQL) + Vercel + CI/CD",           done: false },
  { fase: "Fase 3 — M365",     desc: "Login Microsoft Azure AD + SharePoint",            done: false },
  { fase: "Fase 4 — BI",       desc: "Power BI Embedded + relatórios avançados",        done: false },
];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Informações do sistema e roadmap</p>
      </div>

      {/* Info do sistema */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-widest text-slate-400">
          Informações do sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INFO_SISTEMA.map(({ icon: Icon, label, valor }) => (
            <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <div className="p-2 rounded-lg shrink-0" style={{ background: "#FFF7F4" }}>
                <Icon className="w-4 h-4" style={{ color: "#E8500D" }} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{label}</p>
                <p className="text-slate-700 font-semibold text-sm">{valor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-400 mb-5 text-sm uppercase tracking-widest">
          Roadmap de implantação
        </h2>
        <div className="space-y-3">
          {ROADMAP.map(({ fase, desc, done }) => (
            <div key={fase} className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: done ? "#FFF7F4" : "#F8FAFC", border: `1px solid ${done ? "#FDDCCC" : "#E2E8F0"}` }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: done ? "#E8500D" : "#E2E8F0" }}>
                {done && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: done ? "#E8500D" : "#64748B" }}>{fase}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder configs avançadas */}
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#1E1E1E" }}>
          <Settings className="w-6 h-6" style={{ color: "#E8500D" }} />
        </div>
        <p className="text-slate-500 font-semibold">Configurações avançadas</p>
        <p className="text-sm text-slate-300 mt-1">Usuários, permissões e integrações — disponíveis na versão de produção</p>
      </div>
    </div>
  );
}
