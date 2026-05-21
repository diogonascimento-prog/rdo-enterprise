import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { criarUsuario } from "@/actions/usuarios";

export const metadata: Metadata = { title: "Novo Usuário — RDO Enterprise" };

const ROLES = [
  { value: "GESTOR_PORTFOLIO", label: "Gestor de Portfólio" },
  { value: "ENGENHEIRO",       label: "Engenheiro" },
  { value: "APROVADOR",        label: "Aprovador" },
  { value: "MESTRE_OBRA",      label: "Mestre de Obra" },
  { value: "ELABORADOR",       label: "Elaborador" },
  { value: "VISUALIZADOR",     label: "Visualizador" },
];

export default function NovoUsuarioPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/usuarios" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Novo Usuário</h1>
          <p className="text-sm text-slate-400 mt-0.5">Cadastre um novo colaborador no sistema</p>
        </div>
      </div>

      <form action={criarUsuario} className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nome completo *</label>
            <input name="nome" required className="input" placeholder="Ex: João da Silva" />
          </div>
          <div className="col-span-2">
            <label className="label">E-mail *</label>
            <input name="email" type="email" required className="input" placeholder="joao@engetecnica.com.br" />
          </div>
          <div>
            <label className="label">Senha inicial *</label>
            <input name="senha" type="password" required minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="label">Perfil de acesso *</label>
            <select name="role" required className="input">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Cargo</label>
            <input name="cargo" className="input" placeholder="Ex: Engenheiro Civil" />
          </div>
          <div>
            <label className="label">Registro profissional</label>
            <input name="registro" className="input" placeholder="Ex: CREA-SP 123456" />
          </div>
          <div className="col-span-2">
            <label className="label">Telefone</label>
            <input name="telefone" className="input" placeholder="(11) 99999-9999" />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" className="btn-primary">Criar usuário</button>
          <Link href="/usuarios" className="btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
