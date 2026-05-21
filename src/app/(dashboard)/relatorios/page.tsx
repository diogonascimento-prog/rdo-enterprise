import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RelatoriosClient } from "./RelatoriosClient";

export const metadata: Metadata = { title: "Relatórios — RDO Enterprise" };

export default async function RelatoriosPage() {
  const obras = await prisma.obra.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, codigo: true },
  });

  return <RelatoriosClient obras={obras} />;
}
