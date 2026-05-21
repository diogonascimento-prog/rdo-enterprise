"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardHat, BarChart2, FolderKanban, Settings, LogOut,
  ChevronRight, FileText, Upload, Zap, Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoEngetecnica";

const navGroups = [
  {
    label: "Gestão",
    items: [
      { href: "/obras",     label: "Obras",           icon: HardHat,      desc: "Lista e cadastro"  },
      { href: "/portfolio", label: "Dashboard Geral", icon: FolderKanban, desc: "Visão consolidada" },
    ],
  },
  {
    label: "Relatórios",
    items: [
      { href: "/relatorios", label: "Relatórios", icon: BarChart2, desc: "Exportações Excel" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/usuarios",      label: "Usuários",        icon: Users,    desc: "Acessos e perfis"  },
      { href: "/importar",      label: "Importar Excel",  icon: Upload,   desc: "Cadastro em massa" },
      { href: "/configuracoes", label: "Configurações",   icon: Settings, desc: "Perfil e senha"    },
    ],
  },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  GESTOR_PORTFOLIO: "Gestor de Portfólio",
  ENGENHEIRO: "Engenheiro",
  MESTRE_OBRA: "Mestre de Obra",
  APROVADOR: "Aprovador",
  ELABORADOR: "Elaborador",
  VISUALIZADOR: "Visualizador",
};

export function Sidebar({ userName = "Usuário", userEmail = "", userRole = "" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="h-screen w-64 flex flex-col fixed left-0 top-0 z-30 bg-dark-gradient"
      style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Noise overlay para textura premium */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

      {/* Logo */}
      <div className="flex items-center px-5 py-5 relative"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <LogoMark />
      </div>

      {/* Módulo badge */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl relative overflow-hidden"
          style={{
            background: "rgba(232,80,13,0.08)",
            border: "1px solid rgba(232,80,13,0.16)",
          }}>
          {/* Glow */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(232,80,13,0.4), transparent 70%)" }} />
          <div className="relative">
            <FileText className="w-4 h-4 shrink-0" style={{ color: "#E8500D" }} />
          </div>
          <div className="relative min-w-0">
            <p className="text-xs font-bold text-white leading-none truncate">RDO Enterprise</p>
            <p className="text-[10px] mt-0.5 truncate font-medium" style={{ color: "#E8500D" }}>
              Relatório Diário de Obra
            </p>
          </div>
          <Zap className="w-3 h-3 shrink-0 ml-auto" style={{ color: "rgba(232,80,13,0.5)" }} />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] px-3 mb-2"
              style={{ color: "rgba(255,255,255,0.18)" }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, desc }) => {
                const ativo = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative overflow-hidden",
                      ativo ? "text-white" : "text-slate-500 hover:text-slate-200"
                    )}
                    style={ativo ? {
                      background: "linear-gradient(135deg, rgba(232,80,13,0.90) 0%, rgba(242,101,34,0.85) 100%)",
                      boxShadow: "0 4px 16px rgba(232,80,13,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
                    } : {}}
                    onMouseEnter={e => { if (!ativo) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (!ativo) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Active background glow */}
                    {ativo && (
                      <div className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(255,120,50,0.5), transparent 60%)" }} />
                    )}

                    <div className={cn(
                      "relative p-1.5 rounded-lg shrink-0 transition-all",
                      ativo ? "bg-white/15" : "bg-white/0 group-hover:bg-white/05"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        ativo ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                      )} />
                    </div>

                    <div className="flex-1 min-w-0 relative">
                      <p className={cn(
                        "text-sm font-semibold leading-none",
                        ativo ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      )}>{label}</p>
                      <p className={cn(
                        "text-[10px] mt-0.5 truncate",
                        ativo ? "text-orange-200/70" : "text-slate-600 group-hover:text-slate-500"
                      )}>{desc}</p>
                    </div>

                    {ativo && <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0 relative" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — user */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {/* User card */}
        <div className="px-3 py-2.5 mb-1 rounded-xl flex items-center gap-2.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-black text-xs text-white"
            style={{ background: "linear-gradient(135deg, #E8500D, #F97316)" }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate leading-none">{userName}</p>
            <p className="text-[10px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
              {userEmail || ROLE_LABELS[userRole] || userRole}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-red-400 transition-all w-full group"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <LogOut className="w-3.5 h-3.5 group-hover:text-red-400 transition-colors" />
          <span className="text-xs font-medium group-hover:text-red-400 transition-colors">Sair do sistema</span>
        </button>
      </div>
    </aside>
  );
}
