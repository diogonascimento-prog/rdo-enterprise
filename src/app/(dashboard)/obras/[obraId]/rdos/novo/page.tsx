import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RdoForm } from "@/components/rdo/RdoForm";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { RdoFormValues } from "@/types";

export const metadata: Metadata = { title: "Novo RDO" };

export default async function NovoRdoPage({
  params,
}: {
  params: { obraId: string };
}) {
  const obra = await prisma.obra.findUnique({
    where: { id: params.obraId },
    select: { id: true, nome: true },
  });

  if (!obra) redirect("/obras");

  const session = await getServerSession(authOptions);
  const elaboradorId = (session?.user as any)?.id;
  if (!elaboradorId) redirect("/login");

  async function criarRdo(data: RdoFormValues) {
    "use server";
    const sess = await getServerSession(authOptions);
    const userId = (sess?.user as any)?.id;
    if (!userId) redirect("/login");

    // Busca o último número de RDO da obra
    const ultimo = await prisma.rdo.findFirst({
      where: { obraId: params.obraId },
      orderBy: { numero: "desc" },
      select: { numero: true },
    });

    const rdo = await prisma.rdo.create({
      data: {
        obraId:          params.obraId,
        data:            new Date(data.data),
        turno:           data.turno,
        numero:          (ultimo?.numero ?? 0) + 1,
        observacaoGeral: data.observacaoGeral,
        elaboradorId:    userId,
        status:          "PENDENTE_APROVACAO",
        clima: {
          create: data.clima.map((c) => ({
            periodo:     c.periodo,
            condicao:    c.condicao,
            temperatura: c.temperatura,
            umidade:     c.umidade,
            observacao:  c.observacao,
          })),
        },
        maoDeObra: {
          create: data.maoDeObra.map((m) => ({
            tipo:             m.tipo,
            funcao:           m.funcao as any,
            funcaoDescricao:  m.funcaoDescricao,
            empresa:          m.empresa,
            quantidade:       m.quantidade,
            horasTrabalhadas: m.horasTrabalhadas,
            horasExtras:      m.horasExtras,
          })),
        },
        equipamentos: {
          create: data.equipamentos.map((e) => ({
            nome:          e.nome,
            modelo:        e.modelo,
            quantidade:    e.quantidade,
            horasOperadas: e.horasOperadas,
            horasParadas:  e.horasParadas,
            motivoParada:  e.motivoParada,
          })),
        },
        atividades: {
          create: data.atividades.map((a) => ({
            descricao:           a.descricao,
            frente:              a.frente,
            unidade:             a.unidade,
            quantidadePrevista:  a.quantidadePrevista,
            quantidadeRealizada: a.quantidadeRealizada,
            percentualAvancoDia: a.percentualAvancoDia,
            observacao:          a.observacao,
          })),
        },
        materiais: {
          create: data.materiais.map((m) => ({
            descricao:  m.descricao,
            quantidade: m.quantidade,
            unidade:    m.unidade,
            notaFiscal: m.notaFiscal,
            fornecedor: m.fornecedor,
          })),
        },
        ocorrencias: {
          create: data.ocorrencias.map((o) => ({
            tipo:         o.tipo as any,
            gravidade:    o.gravidade,
            descricao:    o.descricao,
            impacto:      o.impacto,
            acaoImediata: o.acaoImediata,
            responsavel:  o.responsavel,
          })),
        },
      },
    });

    redirect(`/obras/${params.obraId}/rdos/${rdo.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Novo RDO</h1>
        <p className="text-sm text-slate-500 mt-0.5">{obra.nome}</p>
      </div>
      <RdoForm obras={[obra]} onSubmit={criarRdo} />
    </div>
  );
}
