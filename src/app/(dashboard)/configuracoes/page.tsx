import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConfiguracoesClient } from "./ConfiguracoesClient";

export const metadata: Metadata = { title: "Configurações — RDO Enterprise" };

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;

  const usuario = await prisma.usuario.findUnique({
    where: { id: me?.id },
    select: { id: true, nome: true, email: true, cargo: true, registro: true, telefone: true, role: true },
  });

  return <ConfiguracoesClient usuario={usuario} />;
}
