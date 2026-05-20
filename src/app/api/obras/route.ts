import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const obras = await prisma.obra.findMany({
    orderBy: { criadoEm: "desc" },
    select: { id: true, nome: true, codigo: true, status: true, dataInicio: true, dataFimPrevisto: true },
  });
  return NextResponse.json(obras);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { nome, codigo, dataInicio, dataFimPrevisto } = body;

    if (!nome || !codigo || !dataInicio || !dataFimPrevisto) {
      return NextResponse.json(
        { error: "Nome, código, data de início e previsão de término são obrigatórios." },
        { status: 400 }
      );
    }

    const obra = await prisma.obra.create({
      data: {
        nome,
        codigo,
        descricao:           body.descricao ?? null,
        cliente:             body.cliente ?? null,
        responsavelTecnico:  body.responsavelTecnico ?? null,
        art:                 body.art ?? null,
        endereco:            body.endereco ?? null,
        cidade:              body.cidade ?? null,
        estado:              body.estado ?? null,
        cep:                 body.cep ?? null,
        dataInicio:          new Date(dataInicio),
        dataFimPrevisto:     new Date(dataFimPrevisto),
        orcamentoTotal:      body.orcamentoTotal ?? null,
        areaTotal:           body.areaTotal ?? null,
        status:              body.status ?? "PLANEJAMENTO",
      },
    });

    return NextResponse.json(obra, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma obra com este código." },
        { status: 409 }
      );
    }
    console.error("[POST /api/obras]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
