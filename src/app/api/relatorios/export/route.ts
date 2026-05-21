import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const obraId     = searchParams.get("obraId") ?? "";
  const tipo       = searchParams.get("tipo") ?? "rdos";
  const dataInicio = new Date(searchParams.get("dataInicio") ?? "2020-01-01");
  const dataFim    = new Date(searchParams.get("dataFim") ?? new Date().toISOString());
  dataFim.setHours(23, 59, 59);

  const wb = XLSX.utils.book_new();

  if (tipo === "rdos") {
    const rdos = await prisma.rdo.findMany({
      where: { obraId, data: { gte: dataInicio, lte: dataFim } },
      orderBy: { data: "asc" },
      include: {
        elaborador: { select: { nome: true } },
        aprovador:  { select: { nome: true } },
        maoDeObra:  true,
        atividades: true,
        ocorrencias: true,
        clima: true,
      },
    });

    const rows = rdos.map(r => ({
      "Número":        r.numero,
      "Data":          r.data.toLocaleDateString("pt-BR"),
      "Turno":         r.turno,
      "Status":        r.status,
      "Elaborador":    r.elaborador.nome,
      "Aprovador":     r.aprovador?.nome ?? "—",
      "Total MO":      r.maoDeObra.reduce((a, m) => a + m.quantidade, 0),
      "Total HH":      r.maoDeObra.reduce((a, m) => a + m.horasTrabalhadas * m.quantidade, 0),
      "Atividades":    r.atividades.length,
      "Ocorrências":   r.ocorrencias.length,
      "Observações":   r.observacaoGeral ?? "",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "RDOs");

    // Mão de obra detalhada
    const mo: any[] = [];
    rdos.forEach(r => r.maoDeObra.forEach(m => mo.push({
      "Data": r.data.toLocaleDateString("pt-BR"), "RDO Nº": r.numero,
      "Tipo": m.tipo, "Função": m.funcao, "Empresa": m.empresa ?? "—",
      "Qtd": m.quantidade, "HH Trabalhadas": m.horasTrabalhadas, "HH Extras": m.horasExtras,
    })));
    if (mo.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mo), "Mão de Obra");

  } else if (tipo === "atividades") {
    const rdos = await prisma.rdo.findMany({
      where: { obraId, data: { gte: dataInicio, lte: dataFim } },
      orderBy: { data: "asc" },
      include: { atividades: true },
    });
    const rows: any[] = [];
    rdos.forEach(r => r.atividades.forEach(a => rows.push({
      "Data": r.data.toLocaleDateString("pt-BR"), "RDO Nº": r.numero,
      "Frente": a.frente ?? "—", "Descrição": a.descricao,
      "Unidade": a.unidade ?? "—", "Qtd Prevista": a.quantidadePrevista ?? 0,
      "Qtd Realizada": a.quantidadeRealizada ?? 0,
      "Avanço Dia %": (a.percentualAvancoDia * 100).toFixed(1),
      "Observação": a.observacao ?? "",
    })));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ info: "Sem dados" }]), "Atividades");

  } else if (tipo === "maoDeObra") {
    const rdos = await prisma.rdo.findMany({
      where: { obraId, data: { gte: dataInicio, lte: dataFim } },
      orderBy: { data: "asc" },
      include: { maoDeObra: true },
    });
    const rows: any[] = [];
    rdos.forEach(r => r.maoDeObra.forEach(m => rows.push({
      "Data": r.data.toLocaleDateString("pt-BR"), "RDO Nº": r.numero,
      "Tipo": m.tipo, "Função": m.funcao, "Descrição": m.funcaoDescricao ?? "—",
      "Empresa": m.empresa ?? "—", "Quantidade": m.quantidade,
      "HH Trabalhadas": m.horasTrabalhadas, "HH Extras": m.horasExtras,
      "Total HH": m.quantidade * m.horasTrabalhadas,
    })));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ info: "Sem dados" }]), "Efetivo");

  } else if (tipo === "ocorrencias") {
    const rdos = await prisma.rdo.findMany({
      where: { obraId, data: { gte: dataInicio, lte: dataFim } },
      orderBy: { data: "asc" },
      include: { ocorrencias: true },
    });
    const rows: any[] = [];
    rdos.forEach(r => r.ocorrencias.forEach(o => rows.push({
      "Data": r.data.toLocaleDateString("pt-BR"), "RDO Nº": r.numero,
      "Tipo": o.tipo, "Gravidade": o.gravidade, "Descrição": o.descricao,
      "Impacto": o.impacto ?? "—", "Ação Imediata": o.acaoImediata ?? "—",
      "Ação Corretiva": o.acaoCorretiva ?? "—", "Responsável": o.responsavel ?? "—",
      "Concluída": o.concluida ? "Sim" : "Não",
    })));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ info: "Sem ocorrências" }]), "Ocorrências");
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio.xlsx"`,
    },
  });
}
