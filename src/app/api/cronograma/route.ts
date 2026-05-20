import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface TarefaImport {
  wbs: string;
  descricao: string;
  etapa: boolean;
  unidade: string | null;
  quantidadeTotal: number | null;
  pesoRelativo: number;
}

export async function POST(req: NextRequest) {
  try {
    const { obraId, tarefas } = (await req.json()) as {
      obraId: string;
      tarefas: TarefaImport[];
    };

    if (!obraId) return NextResponse.json({ error: "obraId obrigatório." }, { status: 400 });
    if (!tarefas?.length) return NextResponse.json({ error: "Nenhuma tarefa enviada." }, { status: 400 });

    const obra = await prisma.obra.findUnique({
      where: { id: obraId },
      select: { dataInicio: true, dataFimPrevisto: true },
    });
    if (!obra) return NextResponse.json({ error: "Obra não encontrada." }, { status: 404 });

    await prisma.atividadePlanejada.createMany({
      data: tarefas.map((t) => ({
        obraId,
        wbs:            t.wbs,
        descricao:      t.descricao,
        unidade:        t.unidade,
        quantidadeTotal: t.quantidadeTotal,
        pesoRelativo:   t.pesoRelativo,
        dataInicioPrev: obra.dataInicio,
        dataFimPrev:    obra.dataFimPrevisto,
      })),
    });

    return NextResponse.json({ ok: true, importados: tarefas.length });
  } catch (err) {
    console.error("[POST /api/cronograma]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
