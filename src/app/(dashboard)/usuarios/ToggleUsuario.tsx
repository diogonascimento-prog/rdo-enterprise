"use client";
import { UserCheck, UserX } from "lucide-react";
import { toggleUsuarioAtivo } from "@/actions/usuarios";
import { useTransition } from "react";

export function ToggleUsuario({ id, ativo, meuId }: { id: string; ativo: boolean; meuId?: string }) {
  const [pending, startTransition] = useTransition();
  if (id === meuId) return null;
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleUsuarioAtivo(id, !ativo))}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        ativo ? "text-slate-400 hover:text-red-500 hover:bg-red-50" : "text-slate-400 hover:text-green-500 hover:bg-green-50"
      }`}
      title={ativo ? "Desativar usuário" : "Ativar usuário"}
    >
      {ativo ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
    </button>
  );
}
