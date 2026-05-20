import type {
  Obra, Rdo, MaoDeObra, Equipamento, Atividade,
  Material, Ocorrencia, Foto, Clima, Usuario,
  AtividadePlanejada,
} from "@prisma/client";

// Re-exports dos tipos do Prisma (campos String no SQLite)
export type {
  Obra, Rdo, MaoDeObra, Equipamento, Atividade,
  Material, Ocorrencia, Foto, Clima, Usuario,
  AtividadePlanejada,
};

// Valores válidos para os campos String (documentação + type-safety manual)
export type Role         = "ADMIN" | "GESTOR_PORTFOLIO" | "ENGENHEIRO" | "MESTRE_OBRA" | "APROVADOR" | "ELABORADOR" | "VISUALIZADOR";
export type StatusObra   = "PLANEJAMENTO" | "EM_ANDAMENTO" | "PARALISADA" | "CONCLUIDA" | "CANCELADA";
export type StatusRdo    = "RASCUNHO" | "PENDENTE_APROVACAO" | "APROVADO" | "REJEITADO";
export type Turno        = "DIURNO" | "NOTURNO" | "INTEGRAL";
export type PeriodoDia   = "MANHA" | "TARDE" | "NOITE";
export type CondicaoClimatica = "BOM" | "NUBLADO" | "CHUVA_LEVE" | "CHUVA_FORTE" | "IMPRATICAVEL" | "VENTANIA" | "NEBLINA";
export type TipoFuncionario  = "PROPRIO" | "TERCEIRIZADO";
export type FuncaoObra   = "ENGENHEIRO_CIVIL" | "ENGENHEIRO_ELETRICO" | "ENGENHEIRO_MECANICO" | "TECNICO_SEGURANCA" | "TECNICO_EDIFICACOES" | "MESTRE_OBRA" | "ENCARREGADO" | "PEDREIRO" | "SERVENTE" | "CARPINTEIRO" | "FERREIRO_ARMADOR" | "ELETRICISTA" | "ENCANADOR_HIDRAULICO" | "PINTOR" | "AZULEJISTA_CERAMISTA" | "GESSEIRO" | "OPERADOR_EQUIPAMENTO" | "MOTORISTA" | "VIGILANTE" | "OUTRO";
export type TipoOcorrencia    = "ACIDENTE_COM_AFASTAMENTO" | "ACIDENTE_SEM_AFASTAMENTO" | "INCIDENTE" | "QUASE_ACIDENTE" | "PARALISACAO_CHUVA" | "PARALISACAO_FALTA_MATERIAL" | "PARALISACAO_FALTA_EQUIPAMENTO" | "PARALISACAO_FALTA_MAO_DE_OBRA" | "PARALISACAO_PROBLEMA_PROJETO" | "VISITA_TECNICA" | "VISITA_CLIENTE" | "VISITA_FISCALIZACAO" | "OUTRO";
export type GravidadeOcorrencia = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

// RDO completo com todas as relações
export type RdoCompleto = Rdo & {
  obra:       Pick<Obra, "id" | "nome" | "codigo">;
  elaborador: Pick<Usuario, "id" | "nome" | "cargo">;
  aprovador:  Pick<Usuario, "id" | "nome" | "cargo"> | null;
  clima:        Clima[];
  maoDeObra:    MaoDeObra[];
  equipamentos: Equipamento[];
  atividades:   Atividade[];
  materiais:    Material[];
  ocorrencias:  Ocorrencia[];
  fotos:        Foto[];
};

// Tipos para o formulário do RDO
export type RdoFormValues = {
  obraId:          string;
  data:            string;
  turno:           Turno;
  observacaoGeral?: string;
  clima: {
    periodo:     PeriodoDia;
    condicao:    CondicaoClimatica;
    temperatura?: number;
    umidade?:     number;
    observacao?:  string;
  }[];
  maoDeObra: {
    tipo:              TipoFuncionario;
    funcao:            string;
    funcaoDescricao?:  string;
    empresa?:          string;
    quantidade:        number;
    horasTrabalhadas:  number;
    horasExtras:       number;
  }[];
  equipamentos: {
    nome:          string;
    modelo?:       string;
    quantidade:    number;
    horasOperadas: number;
    horasParadas:  number;
    motivoParada?: string;
  }[];
  atividades: {
    descricao:            string;
    frente?:              string;
    unidade?:             string;
    quantidadePrevista?:  number;
    quantidadeRealizada?: number;
    percentualAvancoDia:  number;
    observacao?:          string;
  }[];
  materiais: {
    descricao:  string;
    quantidade: number;
    unidade:    string;
    notaFiscal?: string;
    fornecedor?: string;
  }[];
  ocorrencias: {
    tipo:          string;
    gravidade:     GravidadeOcorrencia;
    descricao:     string;
    impacto?:      string;
    acaoImediata?: string;
    responsavel?:  string;
  }[];
};

// Tipos para os dashboards
export type DadoHistograma = {
  data:       string;
  hhProprio:  number;
  hhTerceiro: number;
  hhTotal:    number;
};

export type DadoCurvaS = {
  data:      string;
  avancoDia: number;
  acumulado: number;
  previsto?: number;
};

export type KpisObra = {
  totalRdos: number;
  diasChuva: number;
  acidentes: number;
  totalHH:   number;
};
