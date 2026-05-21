"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function atualizarPerfil(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) throw new Error("Não autenticado");

  const nome = formData.get("nome") as string;
  const cargo = formData.get("cargo") as string;
  const telefone = formData.get("telefone") as string;
  const registro = formData.get("registro") as string;

  if (!nome) throw new Error("Nome obrigatório");

  await prisma.usuario.update({
    where: { id: user.id },
    data: { nome, cargo: cargo || null, telefone: telefone || null, registro: registro || null },
  });

  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function trocarSenha(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) throw new Error("Não autenticado");

  const senhaAtual = formData.get("senhaAtual") as string;
  const novaSenha = formData.get("novaSenha") as string;
  const confirmar = formData.get("confirmar") as string;

  if (!senhaAtual || !novaSenha || !confirmar) throw new Error("Preencha todos os campos");
  if (novaSenha !== confirmar) throw new Error("As senhas não coincidem");
  if (novaSenha.length < 6) throw new Error("A nova senha deve ter pelo menos 6 caracteres");

  const usuario = await prisma.usuario.findUnique({ where: { id: user.id } });
  if (!usuario) throw new Error("Usuário não encontrado");

  const senhaOk = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!senhaOk) throw new Error("Senha atual incorreta");

  const hash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({ where: { id: user.id }, data: { senha: hash } });

  return { ok: true };
}
