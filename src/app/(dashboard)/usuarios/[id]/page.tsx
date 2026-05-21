import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { atualizarUsuario } from "@/actions/usuarios";

export const metadata: Metadata = { title: "Editar Usuário — RDO Enterprise" };

const ROLES = [
  { value: "GESTOR_PORTFOLIO", label: "Gestor de Portfólio" },
  { value: "ENGENHEIRO",       label: "Engenheiro" },
  { value: "APROVADOR",        label: "Aprovador" },
  { value: "MESTRE_OBRA",      label: "Mestre de Obra" },
  { value: "ELABORADOR",       label: "Elaborador" },
  { value: "VISUALIZADOR",     label: "Visualizador" },
];

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const u = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!u) notFound();

  const action = atualizarUsuario.bind(null, params.id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/usuarios" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Editar Usuário</h1>
          <p className="text-sm text-slate-400 mt-0.5">{u.email}</p>
        </div>
      </div>

      <form action={action} className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nome completo *</label>
            <input name="nome" required defaultValue={u.nome} className="input" />
          </div>
          <div className="col-span-2">
            <label className="label">E-mail *</label>
            <input name="email" type="email" required defaultValue={u.email} className="input" />
          </div>
          <div>
            <label className="label">Perfil de acesso *</label>
            <select name="role" required defaultValue={u.role} className="input">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Cargo</label>
            <input name="cargo" defaultValue={u.cargo ?? ""} className="input" placeholder="Ex: Engenheiro Civil" />
          </div>
          <div>
            <label className="label">Registro profissional</label>
            <input name="registro" defaultValue={u.registro ?? ""} className="input" placeholder="Ex: CREA-SP 123456" />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input name="telefone" defaultValue={u.telefone ?? ""} className="input" placeholder="(11) 99999-9999" />
          </div>
          <div className="col-span-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            <label className="label">Nova senha (deixe em branco para manter)</label>
            <input name="novaSenha" type="password" minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
          </div>
        </div>
        <div className="pt-2 flex gap-3">
          <button type="submit" className="btn-primary">Salvar alterações</button>
          <Link href="/usuarios" className="btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
