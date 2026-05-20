/**
 * Seed de validação — dados realistas para apresentação aos superiores
 * Execute: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Usuários ────────────────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@engetecnica.com.br" },
    update: {},
    create: {
      nome:   "Carlos Mendes",
      email:  "admin@engetecnica.com.br",
      senha:  senhaHash,
      cargo:  "Gestor de Portfólio",
      role:   "GESTOR_PORTFOLIO",
    },
  });

  const engenheiro = await prisma.usuario.upsert({
    where: { email: "engenheiro@engetecnica.com.br" },
    update: {},
    create: {
      nome:    "Rafael Oliveira",
      email:   "engenheiro@engetecnica.com.br",
      senha:   senhaHash,
      cargo:   "Engenheiro Civil",
      registro:"CREA-SP 123456",
      role:    "ENGENHEIRO",
    },
  });

  const mestre = await prisma.usuario.upsert({
    where: { email: "mestre@engetecnica.com.br" },
    update: {},
    create: {
      nome:  "João da Silva",
      email: "mestre@engetecnica.com.br",
      senha: senhaHash,
      cargo: "Mestre de Obra",
      role:  "ELABORADOR",
    },
  });

  console.log("✅ Usuários criados");

  // ── Obra ─────────────────────────────────────────────────────────────────────
  const obra = await prisma.obra.upsert({
    where: { codigo: "OBR-2024-001" },
    update: {},
    create: {
      nome:                "Edifício Central Business — Torre A",
      codigo:              "OBR-2024-001",
      descricao:           "Edifício comercial de 18 pavimentos com subsolo duplo",
      cliente:             "Construtora Horizonte Ltda.",
      responsavelTecnico:  "Rafael Oliveira",
      art:                 "ART-2024-00789",
      endereco:            "Av. Paulista, 1000",
      cidade:              "São Paulo",
      estado:              "SP",
      cep:                 "01310-100",
      dataInicio:          new Date("2024-03-01"),
      dataFimPrevisto:     new Date("2025-12-31"),
      orcamentoTotal:      18_500_000,
      areaTotal:           12_400,
      status:              "EM_ANDAMENTO",
    },
  });

  // Associar usuários à obra
  await prisma.usuarioObra.upsert({
    where: { usuarioId_obraId: { usuarioId: admin.id, obraId: obra.id } },
    update: {},
    create: { usuarioId: admin.id, obraId: obra.id, role: "GESTOR_PORTFOLIO" },
  });
  await prisma.usuarioObra.upsert({
    where: { usuarioId_obraId: { usuarioId: engenheiro.id, obraId: obra.id } },
    update: {},
    create: { usuarioId: engenheiro.id, obraId: obra.id, role: "APROVADOR" },
  });
  await prisma.usuarioObra.upsert({
    where: { usuarioId_obraId: { usuarioId: mestre.id, obraId: obra.id } },
    update: {},
    create: { usuarioId: mestre.id, obraId: obra.id, role: "ELABORADOR" },
  });

  console.log("✅ Obra criada e usuários vinculados");

  // ── Atividades Planejadas (Cronograma) ───────────────────────────────────────
  const atPlanejadas = await Promise.all([
    prisma.atividadePlanejada.create({ data: {
      obraId: obra.id, wbs: "1.1", descricao: "Fundações — Estacas e Blocos",
      unidade: "m³", quantidadeTotal: 480, pesoRelativo: 12,
      dataInicioPrev: new Date("2024-03-01"), dataFimPrev: new Date("2024-05-15"),
    }}),
    prisma.atividadePlanejada.create({ data: {
      obraId: obra.id, wbs: "1.2", descricao: "Estrutura de Concreto — Pilares e Vigas",
      unidade: "m³", quantidadeTotal: 1200, pesoRelativo: 28,
      dataInicioPrev: new Date("2024-05-01"), dataFimPrev: new Date("2024-11-30"),
    }}),
    prisma.atividadePlanejada.create({ data: {
      obraId: obra.id, wbs: "1.3", descricao: "Lajes — Concretagem",
      unidade: "m²", quantidadeTotal: 8200, pesoRelativo: 20,
      dataInicioPrev: new Date("2024-05-15"), dataFimPrev: new Date("2024-12-15"),
    }}),
    prisma.atividadePlanejada.create({ data: {
      obraId: obra.id, wbs: "2.1", descricao: "Alvenaria de Vedação",
      unidade: "m²", quantidadeTotal: 5400, pesoRelativo: 15,
      dataInicioPrev: new Date("2024-08-01"), dataFimPrev: new Date("2025-06-30"),
    }}),
    prisma.atividadePlanejada.create({ data: {
      obraId: obra.id, wbs: "3.1", descricao: "Instalações Elétricas",
      unidade: "un", quantidadeTotal: 1, pesoRelativo: 10,
      dataInicioPrev: new Date("2024-09-01"), dataFimPrev: new Date("2025-09-30"),
    }}),
    prisma.atividadePlanejada.create({ data: {
      obraId: obra.id, wbs: "3.2", descricao: "Instalações Hidrossanitárias",
      unidade: "un", quantidadeTotal: 1, pesoRelativo: 8,
      dataInicioPrev: new Date("2024-09-01"), dataFimPrev: new Date("2025-09-30"),
    }}),
    prisma.atividadePlanejada.create({ data: {
      obraId: obra.id, wbs: "4.1", descricao: "Revestimentos e Acabamentos",
      unidade: "m²", quantidadeTotal: 9600, pesoRelativo: 7,
      dataInicioPrev: new Date("2025-01-01"), dataFimPrev: new Date("2025-11-30"),
    }}),
  ]);

  console.log("✅ Atividades planejadas criadas");

  // ── RDOs dos últimos 7 dias ──────────────────────────────────────────────────
  const hoje     = new Date("2024-06-15");
  const rdosDados = [
    {
      diasAtras: 6, dia: new Date("2024-06-09"),
      hhProprio: 120, hhTerceiro: 64,
      chuva: false, ocorrencia: false,
      ativAvanco: [5, 2.5, 3, 0, 0, 0, 0],
    },
    {
      diasAtras: 5, dia: new Date("2024-06-10"),
      hhProprio: 136, hhTerceiro: 72,
      chuva: false, ocorrencia: false,
      ativAvanco: [4, 3, 3.5, 0, 0, 0, 0],
    },
    {
      diasAtras: 4, dia: new Date("2024-06-11"),
      hhProprio: 112, hhTerceiro: 56,
      chuva: false, ocorrencia: true,
      ativAvanco: [3, 2, 3, 0, 0, 0, 0],
    },
    {
      diasAtras: 3, dia: new Date("2024-06-12"),
      hhProprio: 40, hhTerceiro: 16,
      chuva: true, ocorrencia: false, // dia de chuva — efetivo reduzido
      ativAvanco: [0, 0.5, 0, 0, 0, 0, 0],
    },
    {
      diasAtras: 2, dia: new Date("2024-06-13"),
      hhProprio: 144, hhTerceiro: 88,
      chuva: false, ocorrencia: false,
      ativAvanco: [0, 3.5, 4, 1, 0, 0, 0],
    },
    {
      diasAtras: 1, dia: new Date("2024-06-14"),
      hhProprio: 152, hhTerceiro: 96,
      chuva: false, ocorrencia: false,
      ativAvanco: [0, 4, 4.5, 2, 0, 0, 0],
    },
    {
      diasAtras: 0, dia: new Date("2024-06-15"),
      hhProprio: 128, hhTerceiro: 80,
      chuva: false, ocorrencia: false,
      ativAvanco: [0, 3, 3.5, 1.5, 0, 0, 0],
    },
  ];

  for (let i = 0; i < rdosDados.length; i++) {
    const d = rdosDados[i];

    const rdo = await prisma.rdo.create({
      data: {
        obraId:       obra.id,
        data:         d.dia,
        numero:       i + 1,
        turno:        "DIURNO",
        status:       i < rdosDados.length - 1 ? "APROVADO" : "PENDENTE_APROVACAO",
        elaboradorId: mestre.id,
        aprovadorId:  i < rdosDados.length - 1 ? engenheiro.id : null,
        observacaoGeral: d.chuva ? "Obra paralisada à tarde devido à chuva intensa." : null,

        // Clima
        clima: { create: [
          { periodo: "MANHA", condicao: d.chuva ? "NUBLADO"     : "BOM",         temperatura: d.chuva ? 19 : 24 },
          { periodo: "TARDE", condicao: d.chuva ? "CHUVA_FORTE" : "BOM",         temperatura: d.chuva ? 17 : 27 },
          { periodo: "NOITE", condicao: d.chuva ? "CHUVA_LEVE"  : "NUBLADO",     temperatura: d.chuva ? 16 : 22 },
        ]},

        // Mão de Obra
        maoDeObra: { create: [
          { tipo: "PROPRIO",      funcao: "MESTRE_OBRA",      quantidade: 1,  horasTrabalhadas: d.chuva ? 4 : 8, horasExtras: 0 },
          { tipo: "PROPRIO",      funcao: "ENCARREGADO",      quantidade: 2,  horasTrabalhadas: d.chuva ? 4 : 8, horasExtras: 0 },
          { tipo: "PROPRIO",      funcao: "FERREIRO_ARMADOR", quantidade: 8,  horasTrabalhadas: d.chuva ? 3 : 8, horasExtras: d.chuva ? 0 : 0.5 },
          { tipo: "PROPRIO",      funcao: "CARPINTEIRO",      quantidade: 6,  horasTrabalhadas: d.chuva ? 3 : 8, horasExtras: 0 },
          { tipo: "TERCEIRIZADO", funcao: "PEDREIRO",         empresa: "Constromax Serviços", quantidade: 10, horasTrabalhadas: d.chuva ? 2 : 8, horasExtras: 0 },
          { tipo: "TERCEIRIZADO", funcao: "SERVENTE",         empresa: "Constromax Serviços", quantidade: 8,  horasTrabalhadas: d.chuva ? 2 : 8, horasExtras: 0 },
          { tipo: "PROPRIO",      funcao: "ENGENHEIRO_CIVIL", quantidade: 1,  horasTrabalhadas: 8, horasExtras: 0 },
        ]},

        // Equipamentos
        equipamentos: { create: [
          { nome: "Grua Liebherr 80K",   quantidade: 1, horasOperadas: d.chuva ? 2 : 8, horasParadas: d.chuva ? 6 : 0, motivoParada: d.chuva ? "Paralisação por chuva" : null },
          { nome: "Betoneira 400L",      quantidade: 2, horasOperadas: d.chuva ? 0 : 7, horasParadas: d.chuva ? 8 : 1 },
          { nome: "Andaime metálico",    quantidade: 5, horasOperadas: d.chuva ? 0 : 8, horasParadas: d.chuva ? 8 : 0 },
          { nome: "Bomba de concreto",   quantidade: 1, horasOperadas: d.chuva ? 0 : 6, horasParadas: d.chuva ? 8 : 2, motivoParada: d.chuva ? "Chuva" : "Aguardando concreteiro" },
        ]},

        // Atividades
        atividades: { create: atPlanejadas.map((at, idx) => ({
          atividadePlanejadaId: at.id,
          descricao:   at.descricao,
          frente:      idx === 1 ? "Bloco A — 5° ao 7° pav." : idx === 2 ? "Laje do 6° pavimento" : undefined,
          unidade:     at.unidade ?? undefined,
          percentualAvancoDia: d.ativAvanco[idx],
        })).filter(a => a.percentualAvancoDia > 0)},

        // Materiais
        materiais: i % 2 === 0 ? { create: [
          { descricao: "Cimento CP-II 50kg",   quantidade: 200, unidade: "sc",  notaFiscal: `NF-${5000 + i}`, fornecedor: "Votorantim Cimentos" },
          { descricao: "Brita nº 1",           quantidade: 15,  unidade: "m³",  notaFiscal: `NF-${5001 + i}`, fornecedor: "Pedreira Serra Verde" },
          { descricao: "Areia média lavada",   quantidade: 10,  unidade: "m³",  notaFiscal: `NF-${5002 + i}`, fornecedor: "Areial São João" },
        ]} : undefined,

        // Ocorrências
        ocorrencias: d.chuva
          ? { create: [{ tipo: "PARALISACAO_CHUVA", gravidade: "MEDIA", descricao: "Chuva forte a partir das 13h30 causou paralisação total dos serviços externos. Equipe realocada para serviços internos.", impacto: "Perda estimada de 4h de produção — impacto de ~0.5% no cronograma.", acaoImediata: "Cobertura das armações expostas com lona plástica.", responsavel: "João da Silva" }]}
          : d.ocorrencia
          ? { create: [{ tipo: "QUASE_ACIDENTE", gravidade: "ALTA", descricao: "Trabalhador escorregou na rampa de acesso ao subsolo. Sem lesões.", impacto: "Nenhum impacto no prazo.", acaoImediata: "Aplicação de fita antiderrapante na rampa e DDS emergencial.", responsavel: "João da Silva" }]}
          : undefined,
      },
    });
  }

  console.log("✅ 7 RDOs criados (6 aprovados + 1 pendente)");
  console.log("\n─────────────────────────────────────────────");
  console.log("🚀 Seed concluído! Acesse com:");
  console.log("   Gestor:     admin@engetecnica.com.br  / 123456");
  console.log("   Engenheiro: engenheiro@engetecnica.com.br / 123456");
  console.log("   Mestre:     mestre@engetecnica.com.br  / 123456");
  console.log("─────────────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
