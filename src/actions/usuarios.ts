"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function criarUsuario(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || !["ADMIN", "GESTOR_PORTFOLIO"].includes(user.role)) {
    throw new Error("Sem permissão");
  }

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const cargo = formData.get("cargo") as string;
  const role = formData.get("role") as string;
  const registro = formData.get("registro") as string;
  const telefone = formData.get("telefone") as string;

  if (!nome || !email || !senha) throw new Error("Campos obrigatórios faltando");

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) throw new Error("E-mail já cadastrado");

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: { nome, email, senha: senhaHash, cargo: cargo || null, role: role || "ELABORADOR", registro: registro || null, telefone: telefone || null },
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function atualizarUsuario(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || !["ADMIN", "GESTOR_PORTFOLIO"].includes(user.role)) {
    throw new Error("Sem permissão");
  }

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const cargo = formData.get("cargo") as string;
  const role = formData.get("role") as string;
  const registro = formData.get("registro") as string;
  const telefone = formData.get("telefone") as string;
  const novaSenha = formData.get("novaSenha") as string;

  const data: any = { nome, email, cargo: cargo || null, role, registro: registro || null, telefone: telefone || null };
  if (novaSenha && novaSenha.length >= 6) {
    data.senha = await bcrypt.hash(novaSenha, 10);
  }

  await prisma.usuario.update({ where: { id }, data });
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function toggleUsuarioAtivo(id: string, ativo: boolean) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || !["ADMIN", "GESTOR_PORTFOLIO"].includes(user.role)) {
    throw new Error("Sem permissão");
  }
  await prisma.usuario.update({ where: { id }, data: { ativo } });
  revalidatePath("/usuarios");
}
