/**
 * API de upload de fotos — armazenamento local em /public/uploads/
 * Estrutura: /public/uploads/<slug-obra>/<YYYY-MM-DD>_<slug-atividade>/foto_NNN.ext
 * Gratuito, zero dependência externa.
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files     = formData.getAll("fotos") as File[];
    const nomeObra  = (formData.get("nomeObra")  as string) ?? "obra";
    const data      = (formData.get("data")       as string) ?? new Date().toISOString().split("T")[0];
    const atividade = (formData.get("atividade")  as string) ?? "geral";

    if (!files.length) {
      return NextResponse.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const pasta = path.join(
      process.cwd(),
      "public",
      "uploads",
      slug(nomeObra),
      `${data}_${slug(atividade)}`
    );

    await mkdir(pasta, { recursive: true });

    const resultados = await Promise.all(
      files.map(async (file, idx) => {
        const ext       = file.name.split(".").pop() ?? "jpg";
        const nome      = `foto_${String(idx + 1).padStart(3, "0")}.${ext}`;
        const destino   = path.join(pasta, nome);
        const buffer    = Buffer.from(await file.arrayBuffer());
        await writeFile(destino, buffer);

        // URL pública acessível pelo Next.js
        const urlPublica = `/uploads/${slug(nomeObra)}/${data}_${slug(atividade)}/${nome}`;
        return { nome, urlPublica, tamanho: buffer.byteLength };
      })
    );

    return NextResponse.json({ fotos: resultados });
  } catch (err: any) {
    console.error("[upload]", err);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}

// App Router não usa export const config — bodyParser desabilitado automaticamente em rotas com formData()
