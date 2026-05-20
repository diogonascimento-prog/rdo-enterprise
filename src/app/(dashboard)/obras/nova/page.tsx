"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HardHat, Save } from "lucide-react";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function NovaObraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      nome:                fd.get("nome"),
      codigo:              fd.get("codigo"),
      descricao:           fd.get("descricao") || null,
      cliente:             fd.get("cliente") || null,
      responsavelTecnico:  fd.get("responsavelTecnico") || null,
      art:                 fd.get("art") || null,
      endereco:            fd.get("endereco") || null,
      cidade:              fd.get("cidade") || null,
      estado:              fd.get("estado") || null,
      cep:                 fd.get("cep") || null,
      dataInicio:          fd.get("dataInicio"),
      dataFimPrevisto:     fd.get("dataFimPrevisto"),
      orcamentoTotal:      fd.get("orcamentoTotal") ? Number(fd.get("orcamentoTotal")) : null,
      areaTotal:           fd.get("areaTotal") ? Number(fd.get("areaTotal")) : null,
      status:              fd.get("status"),
    };

    try {
      const res = await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setErro(data.error ?? "Erro ao criar obra.");
        setLoading(false);
        return;
      }

      const obra = await res.json();
      router.push(`/obras/${obra.id}/dashboard`);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/obras" className="hover:text-brand-orange flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Obras
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Nova Obra</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shrink-0"
            style={{ background: "linear-gradient(135deg,#E8500D,#F97316)", boxShadow: "0 4px 12px rgba(232,80,13,0.3)" }}>
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Nova Obra</h1>
            <p className="text-sm text-slate-400">Preencha os dados para cadastrar um novo projeto</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Identificação */}
        <section className="bg-white rounded-2xl p-6 space-y-4"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="text-sm font-bold text-slate-700 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            Identificação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nome da obra *</label>
              <input name="nome" required className="input" placeholder="Ex: Edifício Central Business — Torre A" />
            </div>
            <div>
              <label className="label">Código *</label>
              <input name="codigo" required className="input" placeholder="OBR-2024-001" />
            </div>
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea name="descricao" rows={2} className="input resize-none"
              placeholder="Breve descrição do projeto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Cliente</label>
              <input name="cliente" className="input" placeholder="Ex: Construtora Horizonte Ltda." />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue="PLANEJAMENTO" className="input">
                <option value="PLANEJAMENTO">Planejamento</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="PARALISADA">Paralisada</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          </div>
        </section>

        {/* Responsáveis */}
        <section className="bg-white rounded-2xl p-6 space-y-4"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="text-sm font-bold text-slate-700 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            Responsável Técnico
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Responsável técnico</label>
              <input name="responsavelTecnico" className="input" placeholder="Ex: Rafael Oliveira" />
            </div>
            <div>
              <label className="label">ART / RRT</label>
              <input name="art" className="input" placeholder="Ex: ART-2024-00789" />
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="bg-white rounded-2xl p-6 space-y-4"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="text-sm font-bold text-slate-700 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            Localização
          </h2>

          <div>
            <label className="label">Endereço</label>
            <input name="endereco" className="input" placeholder="Ex: Av. Paulista, 1000" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="label">Cidade</label>
              <input name="cidade" className="input" placeholder="São Paulo" />
            </div>
            <div>
              <label className="label">Estado</label>
              <select name="estado" className="input">
                <option value="">—</option>
                {ESTADOS_BR.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">CEP</label>
              <input name="cep" className="input" placeholder="00000-000" />
            </div>
          </div>
        </section>

        {/* Datas e Orçamento */}
        <section className="bg-white rounded-2xl p-6 space-y-4"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="text-sm font-bold text-slate-700 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            Prazo e Orçamento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Data de início *</label>
              <input name="dataInicio" type="date" required className="input" />
            </div>
            <div>
              <label className="label">Previsão de término *</label>
              <input name="dataFimPrevisto" type="date" required className="input" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Orçamento total (R$)</label>
              <input name="orcamentoTotal" type="number" step="0.01" min="0" className="input"
                placeholder="Ex: 18500000" />
            </div>
            <div>
              <label className="label">Área total (m²)</label>
              <input name="areaTotal" type="number" step="0.01" min="0" className="input"
                placeholder="Ex: 12400" />
            </div>
          </div>
        </section>

        {erro && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {erro}
          </p>
        )}

        {/* Ações */}
        <div className="flex items-center gap-3 justify-end pb-6">
          <Link href="/obras" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="w-4 h-4" />
            {loading ? "Salvando…" : "Criar Obra"}
          </button>
        </div>
      </form>
    </div>
  );
}
