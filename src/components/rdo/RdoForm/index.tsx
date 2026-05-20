"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, CloudRain, Users, Wrench, CheckSquare, Package, AlertTriangle, Camera, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RdoFormValues } from "@/types";

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  obraId:          z.string().min(1, "Selecione uma obra"),
  data:            z.string().min(1, "Informe a data"),
  turno:           z.enum(["DIURNO", "NOTURNO", "INTEGRAL"]),
  observacaoGeral: z.string().optional(),
  clima: z.array(z.object({
    periodo:     z.enum(["MANHA", "TARDE", "NOITE"]),
    condicao:    z.enum(["BOM","NUBLADO","CHUVA_LEVE","CHUVA_FORTE","IMPRATICAVEL","VENTANIA","NEBLINA"]),
    temperatura: z.coerce.number().optional(),
    umidade:     z.coerce.number().optional(),
    observacao:  z.string().optional(),
  })),
  maoDeObra: z.array(z.object({
    tipo:             z.enum(["PROPRIO","TERCEIRIZADO"]),
    funcao:           z.string().min(1),
    funcaoDescricao:  z.string().optional(),
    empresa:          z.string().optional(),
    quantidade:       z.coerce.number().min(1),
    horasTrabalhadas: z.coerce.number().min(0),
    horasExtras:      z.coerce.number().min(0),
  })),
  equipamentos: z.array(z.object({
    nome:         z.string().min(1),
    modelo:       z.string().optional(),
    quantidade:   z.coerce.number().min(1),
    horasOperadas: z.coerce.number().min(0),
    horasParadas:  z.coerce.number().min(0),
    motivoParada:  z.string().optional(),
  })),
  atividades: z.array(z.object({
    descricao:           z.string().min(1),
    frente:              z.string().optional(),
    unidade:             z.string().optional(),
    quantidadePrevista:  z.coerce.number().optional(),
    quantidadeRealizada: z.coerce.number().optional(),
    percentualAvancoDia: z.coerce.number().min(0).max(100),
    observacao:          z.string().optional(),
  })),
  materiais: z.array(z.object({
    descricao:  z.string().min(1),
    quantidade: z.coerce.number().min(0),
    unidade:    z.string().min(1),
    notaFiscal: z.string().optional(),
    fornecedor: z.string().optional(),
  })),
  ocorrencias: z.array(z.object({
    tipo:         z.string().min(1),
    gravidade:    z.enum(["BAIXA","MEDIA","ALTA","CRITICA"]),
    descricao:    z.string().min(1),
    impacto:      z.string().optional(),
    acaoImediata: z.string().optional(),
    responsavel:  z.string().optional(),
  })),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
type Obra = { id: string; nome: string };

const PERIODOS  = [
  { value: "MANHA",  label: "Manhã"  },
  { value: "TARDE",  label: "Tarde"  },
  { value: "NOITE",  label: "Noite"  },
] as const;

const CONDICOES = [
  { value: "BOM",          label: "☀️ Bom"            },
  { value: "NUBLADO",      label: "⛅ Nublado"        },
  { value: "CHUVA_LEVE",   label: "🌦️ Chuva leve"    },
  { value: "CHUVA_FORTE",  label: "🌧️ Chuva forte"   },
  { value: "IMPRATICAVEL", label: "⛈️ Impraticável"  },
  { value: "VENTANIA",     label: "💨 Ventania"       },
  { value: "NEBLINA",      label: "🌫️ Neblina"       },
] as const;

const FUNCOES = [
  "ENGENHEIRO_CIVIL","TECNICO_EDIFICACOES","MESTRE_OBRA","ENCARREGADO",
  "PEDREIRO","SERVENTE","CARPINTEIRO","FERREIRO_ARMADOR","ELETRICISTA",
  "ENCANADOR_HIDRAULICO","PINTOR","AZULEJISTA_CERAMISTA","GESSEIRO",
  "OPERADOR_EQUIPAMENTO","MOTORISTA","VIGILANTE","OUTRO",
];

const FUNCAO_LABEL: Record<string, string> = {
  ENGENHEIRO_CIVIL:      "Engenheiro Civil",
  TECNICO_EDIFICACOES:   "Técnico em Edificações",
  MESTRE_OBRA:           "Mestre de Obra",
  ENCARREGADO:           "Encarregado",
  PEDREIRO:              "Pedreiro",
  SERVENTE:              "Servente",
  CARPINTEIRO:           "Carpinteiro",
  FERREIRO_ARMADOR:      "Ferreiro / Armador",
  ELETRICISTA:           "Eletricista",
  ENCANADOR_HIDRAULICO:  "Encanador / Hidráulico",
  PINTOR:                "Pintor",
  AZULEJISTA_CERAMISTA:  "Azulejista / Ceramista",
  GESSEIRO:              "Gesseiro",
  OPERADOR_EQUIPAMENTO:  "Operador de Equipamento",
  MOTORISTA:             "Motorista",
  VIGILANTE:             "Vigilante",
  OUTRO:                 "Outro",
};

const TIPOS_OCORRENCIA = [
  { value: "ACIDENTE_COM_AFASTAMENTO",    label: "Acidente c/ afastamento" },
  { value: "ACIDENTE_SEM_AFASTAMENTO",    label: "Acidente s/ afastamento" },
  { value: "INCIDENTE",                   label: "Incidente" },
  { value: "QUASE_ACIDENTE",              label: "Quase-acidente" },
  { value: "PARALISACAO_CHUVA",           label: "Paralisação — Chuva" },
  { value: "PARALISACAO_FALTA_MATERIAL",  label: "Paralisação — Falta de material" },
  { value: "PARALISACAO_FALTA_EQUIPAMENTO", label: "Paralisação — Falta de equipamento" },
  { value: "PARALISACAO_FALTA_MAO_DE_OBRA", label: "Paralisação — Falta de mão de obra" },
  { value: "PARALISACAO_PROBLEMA_PROJETO",  label: "Paralisação — Problema de projeto" },
  { value: "VISITA_TECNICA",              label: "Visita técnica" },
  { value: "VISITA_CLIENTE",              label: "Visita do cliente" },
  { value: "VISITA_FISCALIZACAO",         label: "Visita de fiscalização" },
  { value: "OUTRO",                       label: "Outro" },
];

// ─── Componente de Seção colapsável ──────────────────────────────────────────
function Secao({
  titulo, icone: Icone, contador, children, cor = "blue",
}: {
  titulo: string;
  icone: React.ElementType;
  contador?: number;
  children: React.ReactNode;
  cor?: "blue" | "green" | "orange" | "red" | "purple" | "yellow";
}) {
  const [aberta, setAberta] = useState(true);
  const cores: Record<string, string> = {
    blue:   "bg-blue-50 border-blue-200 text-blue-700",
    green:  "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red:    "bg-red-50 border-red-200 text-red-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setAberta(!aberta)}
        className={cn(
          "w-full flex items-center justify-between px-5 py-3.5 text-left border-b",
          cores[cor]
        )}
      >
        <div className="flex items-center gap-2.5 font-semibold text-sm">
          <Icone className="w-4 h-4" />
          {titulo}
          {contador !== undefined && (
            <span className="bg-white/70 px-2 py-0.5 rounded-full text-xs font-bold">
              {contador}
            </span>
          )}
        </div>
        {aberta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {aberta && <div className="p-5 bg-white space-y-4">{children}</div>}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface RdoFormProps {
  obras: Obra[];
  onSubmit: (data: RdoFormValues) => Promise<void>;
}

export function RdoForm({ obras, onSubmit }: RdoFormProps) {
  const [salvando, setSalvando] = useState(false);

  const form = useForm<RdoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      turno: "DIURNO",
      clima: PERIODOS.map((p) => ({
        periodo: p.value, condicao: "BOM", temperatura: undefined, umidade: undefined,
      })),
      maoDeObra:   [],
      equipamentos: [],
      atividades:  [],
      materiais:   [],
      ocorrencias: [],
    },
  });

  const {
    register, control, handleSubmit, watch,
    formState: { errors },
  } = form;

  const maoDeObraArr  = useFieldArray({ control, name: "maoDeObra"   });
  const equipArr      = useFieldArray({ control, name: "equipamentos" });
  const atividadesArr = useFieldArray({ control, name: "atividades"   });
  const materiaisArr  = useFieldArray({ control, name: "materiais"    });
  const ocorrArr      = useFieldArray({ control, name: "ocorrencias"  });

  async function handleSave(data: RdoFormValues) {
    setSalvando(true);
    try { await onSubmit(data); }
    finally { setSalvando(false); }
  }

  const totalHH = watch("maoDeObra").reduce(
    (acc, m) => acc + (m.quantidade || 0) * ((m.horasTrabalhadas || 0) + (m.horasExtras || 0)),
    0
  );

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-5 max-w-4xl mx-auto">

      {/* ── CABEÇALHO ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-bold text-slate-700 text-base mb-4">Cabeçalho do RDO</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="label">Obra *</label>
            <select {...register("obraId")} className="input">
              <option value="">Selecione...</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
            {errors.obraId && <p className="erro">{errors.obraId.message}</p>}
          </div>
          <div>
            <label className="label">Data *</label>
            <input type="date" {...register("data")} className="input" />
            {errors.data && <p className="erro">{errors.data.message}</p>}
          </div>
          <div>
            <label className="label">Turno</label>
            <select {...register("turno")} className="input">
              <option value="DIURNO">Diurno</option>
              <option value="NOTURNO">Noturno</option>
              <option value="INTEGRAL">Integral</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Observação geral</label>
          <textarea {...register("observacaoGeral")} rows={2} className="input resize-none" placeholder="Observações gerais do dia..." />
        </div>
      </div>

      {/* ── CLIMA ─────────────────────────────────────────────── */}
      <Secao titulo="Condições Climáticas" icone={CloudRain} cor="blue">
        <div className="grid grid-cols-1 gap-4">
          {PERIODOS.map((p, i) => (
            <div key={p.value} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end bg-slate-50 rounded-lg p-3">
              <div>
                <label className="label">{p.label}</label>
                <select {...register(`clima.${i}.condicao`)} className="input">
                  {CONDICOES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Temp. (°C)</label>
                <input type="number" step="0.1" {...register(`clima.${i}.temperatura`)} className="input" placeholder="ex: 28" />
              </div>
              <div>
                <label className="label">Umidade (%)</label>
                <input type="number" {...register(`clima.${i}.umidade`)} className="input" placeholder="ex: 75" />
              </div>
              <div>
                <label className="label">Obs.</label>
                <input type="text" {...register(`clima.${i}.observacao`)} className="input" placeholder="Opcional" />
              </div>
            </div>
          ))}
        </div>
      </Secao>

      {/* ── MÃO DE OBRA ───────────────────────────────────────── */}
      <Secao
        titulo="Mão de Obra — Efetivo"
        icone={Users}
        contador={maoDeObraArr.fields.length}
        cor="green"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">
            Total HH do dia: <strong className="text-slate-700">{totalHH.toFixed(1)} h</strong>
          </span>
          <button
            type="button"
            onClick={() => maoDeObraArr.append({
              tipo: "PROPRIO", funcao: "PEDREIRO", quantidade: 1,
              horasTrabalhadas: 8, horasExtras: 0,
            })}
            className="btn-add"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {maoDeObraArr.fields.length === 0 && (
          <p className="vazio">Nenhum registro. Clique em "Adicionar" para incluir efetivo.</p>
        )}

        {maoDeObraArr.fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end bg-slate-50 rounded-lg p-3 relative">
            <div>
              <label className="label">Tipo</label>
              <select {...register(`maoDeObra.${i}.tipo`)} className="input">
                <option value="PROPRIO">Próprio</option>
                <option value="TERCEIRIZADO">Terceirizado</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Função</label>
              <select {...register(`maoDeObra.${i}.funcao`)} className="input">
                {FUNCOES.map((f) => (
                  <option key={f} value={f}>{FUNCAO_LABEL[f] ?? f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Qtd</label>
              <input type="number" min={1} {...register(`maoDeObra.${i}.quantidade`)} className="input" />
            </div>
            <div>
              <label className="label">Horas trab.</label>
              <input type="number" step="0.5" min={0} {...register(`maoDeObra.${i}.horasTrabalhadas`)} className="input" />
            </div>
            <div>
              <label className="label">H. extras</label>
              <input type="number" step="0.5" min={0} {...register(`maoDeObra.${i}.horasExtras`)} className="input" />
            </div>
            <button type="button" onClick={() => maoDeObraArr.remove(i)} className="btn-remove sm:absolute sm:top-2 sm:right-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {watch(`maoDeObra.${i}.funcao`) === "OUTRO" && (
              <div className="col-span-full">
                <label className="label">Descrição da função</label>
                <input type="text" {...register(`maoDeObra.${i}.funcaoDescricao`)} className="input" placeholder="Descreva a função..." />
              </div>
            )}
            {watch(`maoDeObra.${i}.tipo`) === "TERCEIRIZADO" && (
              <div className="col-span-full">
                <label className="label">Empresa terceirizada</label>
                <input type="text" {...register(`maoDeObra.${i}.empresa`)} className="input" placeholder="Nome da empresa..." />
              </div>
            )}
          </div>
        ))}
      </Secao>

      {/* ── EQUIPAMENTOS ──────────────────────────────────────── */}
      <Secao titulo="Equipamentos" icone={Wrench} contador={equipArr.fields.length} cor="orange">
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => equipArr.append({ nome: "", quantidade: 1, horasOperadas: 8, horasParadas: 0 })}
            className="btn-add"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {equipArr.fields.length === 0 && (
          <p className="vazio">Nenhum equipamento registrado.</p>
        )}

        {equipArr.fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end bg-slate-50 rounded-lg p-3 relative">
            <div className="sm:col-span-2">
              <label className="label">Equipamento *</label>
              <input type="text" {...register(`equipamentos.${i}.nome`)} className="input" placeholder="ex: Betoneira 400L" />
            </div>
            <div>
              <label className="label">Qtd</label>
              <input type="number" min={1} {...register(`equipamentos.${i}.quantidade`)} className="input" />
            </div>
            <div>
              <label className="label">Hrs operadas</label>
              <input type="number" step="0.5" min={0} {...register(`equipamentos.${i}.horasOperadas`)} className="input" />
            </div>
            <div>
              <label className="label">Hrs paradas</label>
              <input type="number" step="0.5" min={0} {...register(`equipamentos.${i}.horasParadas`)} className="input" />
            </div>
            {(watch(`equipamentos.${i}.horasParadas`) || 0) > 0 && (
              <div className="col-span-full">
                <label className="label">Motivo da parada</label>
                <input type="text" {...register(`equipamentos.${i}.motivoParada`)} className="input" placeholder="Descreva o motivo..." />
              </div>
            )}
            <button type="button" onClick={() => equipArr.remove(i)} className="btn-remove sm:absolute sm:top-2 sm:right-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </Secao>

      {/* ── ATIVIDADES ────────────────────────────────────────── */}
      <Secao titulo="Atividades Realizadas" icone={CheckSquare} contador={atividadesArr.fields.length} cor="purple">
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => atividadesArr.append({ descricao: "", percentualAvancoDia: 0 })}
            className="btn-add"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {atividadesArr.fields.length === 0 && (
          <p className="vazio">Nenhuma atividade registrada.</p>
        )}

        {atividadesArr.fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end bg-slate-50 rounded-lg p-3 relative">
            <div className="col-span-full sm:col-span-3">
              <label className="label">Descrição *</label>
              <input type="text" {...register(`atividades.${i}.descricao`)} className="input" placeholder="ex: Concretagem da laje do 3° pavimento" />
            </div>
            <div>
              <label className="label">Frente / Local</label>
              <input type="text" {...register(`atividades.${i}.frente`)} className="input" placeholder="ex: Bloco A" />
            </div>
            <div>
              <label className="label">% Avanço hoje *</label>
              <div className="relative">
                <input
                  type="number" min={0} max={100} step={0.5}
                  {...register(`atividades.${i}.percentualAvancoDia`)}
                  className="input pr-7"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
              </div>
            </div>
            <div>
              <label className="label">Un.</label>
              <input type="text" {...register(`atividades.${i}.unidade`)} className="input" placeholder="m², m³..." />
            </div>
            <div>
              <label className="label">Qtd prevista</label>
              <input type="number" step="0.01" {...register(`atividades.${i}.quantidadePrevista`)} className="input" />
            </div>
            <div>
              <label className="label">Qtd realizada</label>
              <input type="number" step="0.01" {...register(`atividades.${i}.quantidadeRealizada`)} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observação</label>
              <input type="text" {...register(`atividades.${i}.observacao`)} className="input" placeholder="Opcional" />
            </div>
            <button type="button" onClick={() => atividadesArr.remove(i)} className="btn-remove sm:absolute sm:top-2 sm:right-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </Secao>

      {/* ── MATERIAIS ─────────────────────────────────────────── */}
      <Secao titulo="Materiais Recebidos" icone={Package} contador={materiaisArr.fields.length} cor="yellow">
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => materiaisArr.append({ descricao: "", quantidade: 0, unidade: "un" })}
            className="btn-add"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {materiaisArr.fields.length === 0 && (
          <p className="vazio">Nenhum material recebido hoje.</p>
        )}

        {materiaisArr.fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end bg-slate-50 rounded-lg p-3 relative">
            <div className="sm:col-span-2">
              <label className="label">Material *</label>
              <input type="text" {...register(`materiais.${i}.descricao`)} className="input" placeholder="ex: Cimento CP-II 50kg" />
            </div>
            <div>
              <label className="label">Quantidade *</label>
              <input type="number" step="0.01" min={0} {...register(`materiais.${i}.quantidade`)} className="input" />
            </div>
            <div>
              <label className="label">Unidade *</label>
              <input type="text" {...register(`materiais.${i}.unidade`)} className="input" placeholder="sc, m³, kg..." />
            </div>
            <div>
              <label className="label">Nota Fiscal</label>
              <input type="text" {...register(`materiais.${i}.notaFiscal`)} className="input" placeholder="Nº NF" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Fornecedor</label>
              <input type="text" {...register(`materiais.${i}.fornecedor`)} className="input" placeholder="Nome do fornecedor" />
            </div>
            <button type="button" onClick={() => materiaisArr.remove(i)} className="btn-remove sm:absolute sm:top-2 sm:right-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </Secao>

      {/* ── OCORRÊNCIAS E SMS ─────────────────────────────────── */}
      <Secao titulo="Ocorrências e SMS" icone={AlertTriangle} contador={ocorrArr.fields.length} cor="red">
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => ocorrArr.append({ tipo: "INCIDENTE", gravidade: "BAIXA", descricao: "" })}
            className="btn-add"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar ocorrência
          </button>
        </div>

        {ocorrArr.fields.length === 0 && (
          <p className="vazio">Nenhuma ocorrência registrada — ótimo dia! ✅</p>
        )}

        {ocorrArr.fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end bg-red-50/60 rounded-lg p-3 relative border border-red-100">
            <div className="sm:col-span-2">
              <label className="label">Tipo *</label>
              <select {...register(`ocorrencias.${i}.tipo`)} className="input">
                {TIPOS_OCORRENCIA.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gravidade</label>
              <select {...register(`ocorrencias.${i}.gravidade`)} className="input">
                <option value="BAIXA">🟢 Baixa</option>
                <option value="MEDIA">🟡 Média</option>
                <option value="ALTA">🟠 Alta</option>
                <option value="CRITICA">🔴 Crítica</option>
              </select>
            </div>
            <div>
              <label className="label">Responsável</label>
              <input type="text" {...register(`ocorrencias.${i}.responsavel`)} className="input" placeholder="Nome" />
            </div>
            <div className="col-span-full">
              <label className="label">Descrição *</label>
              <textarea rows={2} {...register(`ocorrencias.${i}.descricao`)} className="input resize-none" placeholder="Descreva a ocorrência..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Impacto no prazo/custo</label>
              <input type="text" {...register(`ocorrencias.${i}.impacto`)} className="input" placeholder="Descreva o impacto..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Ação imediata tomada</label>
              <input type="text" {...register(`ocorrencias.${i}.acaoImediata`)} className="input" placeholder="Ação realizada..." />
            </div>
            <button type="button" onClick={() => ocorrArr.remove(i)} className="btn-remove sm:absolute sm:top-2 sm:right-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </Secao>

      {/* ── GALERIA DE FOTOS — upload local ──────────────────── */}
      <Secao titulo="Galeria de Fotos" icone={Camera} cor="blue">
        <FotoUpload />
      </Secao>

      {/* ── BOTÕES DE AÇÃO ────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button type="button" className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Salvar rascunho
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-2"
        >
          {salvando ? "Enviando para aprovação..." : "Enviar para aprovação →"}
        </button>
      </div>
    </form>
  );
}

// ─── Componente de upload local ───────────────────────────────────────────────
function FotoUpload() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [enviadas, setEnviadas]   = useState<string[]>([]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Preview local imediato
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    setUploading(true);

    const form = new FormData();
    files.forEach((f) => form.append("fotos", f));
    form.append("nomeObra",  "Edificio-Central");
    form.append("data",      new Date().toISOString().split("T")[0]);
    form.append("atividade", "Registro-Geral");

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      setEnviadas(json.fotos?.map((f: any) => f.urlPublica) ?? []);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
        <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 mb-1">
          {uploading ? "Enviando fotos..." : "Arraste ou clique para selecionar fotos"}
        </p>
        <p className="text-xs text-slate-400 mb-3">
          Salvas em <code className="bg-slate-100 px-1 rounded">/public/uploads/</code> — sem custo
        </p>
        <input
          type="file" accept="image/*" multiple
          className="hidden" id="fotos-upload"
          onChange={handleChange}
        />
        <label
          htmlFor="fotos-upload"
          className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Selecionar fotos
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
              {enviadas[i] && (
                <div className="absolute bottom-0 inset-x-0 bg-green-600/80 text-white text-[10px] text-center py-0.5">
                  ✓ Salva
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
