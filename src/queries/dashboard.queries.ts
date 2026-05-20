import { prisma } from "@/lib/prisma";

// Retorna o percentual acumulado de uma atividade planejada até uma data
export async function getPercentualAcumulado(
  atividadePlanejadaId: string,
  obraId: string,
  ate: Date
): Promise<number> {
  const result = await prisma.atividade.aggregate({
    where: {
      atividadePlanejadaId,
      rdo: { obraId, data: { lte: ate } },
    },
    _sum: { percentualAvancoDia: true },
  });
  return result._sum.percentualAvancoDia ?? 0;
}

// Histograma de mão de obra: HH por dia em um intervalo
export async function getHistogramaEfetivo(
  obraId: string,
  de: Date,
  ate: Date
) {
  const rdos = await prisma.rdo.findMany({
    where: { obraId, data: { gte: de, lte: ate }, status: "APROVADO" },
    select: {
      data: true,
      maoDeObra: {
        select: { quantidade: true, horasTrabalhadas: true, horasExtras: true, tipo: true },
      },
    },
    orderBy: { data: "asc" },
  });

  return rdos.map((rdo) => {
    const hhProprio = rdo.maoDeObra
      .filter((m) => m.tipo === "PROPRIO")
      .reduce((acc, m) => acc + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0);
    const hhTerceiro = rdo.maoDeObra
      .filter((m) => m.tipo === "TERCEIRIZADO")
      .reduce((acc, m) => acc + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0);
    return { data: rdo.data, hhProprio, hhTerceiro, hhTotal: hhProprio + hhTerceiro };
  });
}

// Curva S: avanço físico acumulado diário
export async function getCurvaS(obraId: string, de: Date, ate: Date) {
  const atividades = await prisma.atividadePlanejada.findMany({
    where: { obraId },
    select: {
      id: true,
      pesoRelativo: true,
      atividadesRdo: {
        where: { rdo: { data: { gte: de, lte: ate } } },
        select: { percentualAvancoDia: true, rdo: { select: { data: true } } },
        orderBy: { rdo: { data: "asc" } },
      },
    },
  });

  // Agrega o avanço ponderado por dia
  const mapaAvanco = new Map<string, number>();
  for (const at of atividades) {
    for (const reg of at.atividadesRdo) {
      const chave = reg.rdo.data.toISOString().split("T")[0];
      const contribuicao = (reg.percentualAvancoDia / 100) * at.pesoRelativo;
      mapaAvanco.set(chave, (mapaAvanco.get(chave) ?? 0) + contribuicao);
    }
  }

  // Acumula e retorna array ordenado
  const dias = Array.from(mapaAvanco.entries()).sort(([a], [b]) => a.localeCompare(b));
  let acumulado = 0;
  return dias.map(([data, avancoDia]) => {
    acumulado += avancoDia;
    return { data, avancoDia: +avancoDia.toFixed(2), acumulado: +acumulado.toFixed(2) };
  });
}

// KPIs gerais de uma obra
export async function getKpisObra(obraId: string) {
  const [totalRdos, diasChuva, acidentes, totalHH] = await Promise.all([
    prisma.rdo.count({ where: { obraId, status: "APROVADO" } }),
    prisma.clima.count({
      where: {
        condicao: { in: ["CHUVA_FORTE", "IMPRATICAVEL"] },
        rdo: { obraId },
      },
    }),
    prisma.ocorrencia.count({
      where: {
        tipo: { in: ["ACIDENTE_COM_AFASTAMENTO", "ACIDENTE_SEM_AFASTAMENTO"] },
        rdo: { obraId },
      },
    }),
    prisma.maoDeObra.aggregate({
      where: { rdo: { obraId, status: "APROVADO" } },
      _sum: { horasTrabalhadas: true, horasExtras: true },
    }),
  ]);

  const horasTotais =
    (totalHH._sum.horasTrabalhadas ?? 0) + (totalHH._sum.horasExtras ?? 0);

  return { totalRdos, diasChuva, acidentes, totalHH: horasTotais };
}

// Ocorrências agrupadas por tipo para gráfico de pizza
export async function getOcorrenciasPorTipo(obraId: string, de?: Date, ate?: Date) {
  const where = {
    rdo: {
      obraId,
      ...(de || ate ? { data: { ...(de && { gte: de }), ...(ate && { lte: ate }) } } : {}),
    },
  };

  return prisma.ocorrencia.groupBy({
    by: ["tipo"],
    where,
    _count: { tipo: true },
    orderBy: { _count: { tipo: "desc" } },
  });
}
