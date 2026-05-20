import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { parse, isValid } from "date-fns";

// Roles válidas
const ROLES_VALIDAS = new Set([
  "ADMIN", "GESTOR_PORTFOLIO", "ENGENHEIRO", "MESTRE_OBRA",
  "APROVADOR", "ELABORADOR", "VISUALIZADOR",
]);
const STATUS_VALIDOS = new Set([
  "PLANEJAMENTO", "EM_ANDAMENTO", "PARALISADA", "CONCLUIDA", "CANCELADA",
]);

function parseData(valor: unknown): Date | null {
  if (!valor) return null;
  const str = String(valor).trim();
  // Tenta DD/MM/AAAA
  const d1 = parse(str, "dd/MM/yyyy", new Date());
  if (isValid(d1)) return d1;
  // Tenta número serial do Excel
  const n = Number(str);
  if (!isNaN(n) && n > 1000) {
    const d = new Date((n - 25569) * 86400 * 1000);
    if (isValid(d)) return d;
  }
  // Tenta ISO
  const d2 = new Date(str);
  if (isValid(d2)) return d2;
  return null;
}

function str(v: unknown) {
  return v !== null && v !== undefined ? String(v).trim() : "";
}

function num(v: unknown) {
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer", cellDates: false });

  const resultados = {
    obras:    { importados: 0, pulados: 0, erros: [] as string[] },
    usuarios: { importados: 0, pulados: 0, erros: [] as string[] },
  };

  // ── OBRAS ──────────────────────────────────────────────────────────────────
  const wsObras = wb.Sheets["Obras"];
  if (wsObras) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsObras, { defval: "" });
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const linha = i + 2; // +2 porque linha 1 é cabeçalho

      const nome   = str(row["nome*"]);
      const codigo = str(row["codigo*"]);
      if (!nome || !codigo) {
        // Linha vazia ou incompleta, pula silenciosamente
        continue;
      }

      const dataInicio     = parseData(row["dataInicio*\n(DD/MM/AAAA)"]) ?? parseData(row["dataInicio*"]);
      const dataFimPrevisto = parseData(row["dataFimPrevisto*\n(DD/MM/AAAA)"]) ?? parseData(row["dataFimPrevisto*"]);

      if (!dataInicio) {
        resultados.obras.erros.push(`Linha ${linha} (${codigo}): dataInicio inválida.`);
        continue;
      }
      if (!dataFimPrevisto) {
        resultados.obras.erros.push(`Linha ${linha} (${codigo}): dataFimPrevisto inválida.`);
        continue;
      }

      const statusRaw = str(row["status\n(PLANEJAMENTO|EM_ANDAMENTO|PARALISADA|CONCLUIDA|CANCELADA)"] ?? row["status"]).toUpperCase();
      const status = STATUS_VALIDOS.has(statusRaw) ? statusRaw : "PLANEJAMENTO";

      try {
        const exists = await prisma.obra.findUnique({ where: { codigo } });
        if (exists) {
          resultados.obras.pulados++;
          continue;
        }
        await prisma.obra.create({
          data: {
            nome,
            codigo,
            cliente:            str(row["cliente"]) || null,
            responsavelTecnico: str(row["responsavelTecnico"]) || null,
            art:                str(row["art"]) || null,
            endereco:           str(row["endereco"]) || null,
            cidade:             str(row["cidade"]) || null,
            estado:             str(row["estado"]) || null,
            cep:                str(row["cep"]) || null,
            descricao:          str(row["descricao"]) || null,
            orcamentoTotal:     num(row["orcamentoTotal"]),
            areaTotal:          num(row["areaTotal"]),
            dataInicio,
            dataFimPrevisto,
            status,
          },
        });
        resultados.obras.importados++;
      } catch (e) {
        resultados.obras.erros.push(`Linha ${linha} (${codigo}): erro ao salvar — ${(e as Error).message}`);
      }
    }
  }

  // ── USUÁRIOS ───────────────────────────────────────────────────────────────
  const wsUsuarios = wb.Sheets["Usuarios"];
  if (wsUsuarios) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsUsuarios, { defval: "" });
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const linha = i + 2;

      const nome  = str(row["nome*"]);
      const email = str(row["email*"]).toLowerCase();
      const senha = str(row["senha_inicial*"]);

      if (!nome || !email || !senha) continue;

      if (senha.length < 6) {
        resultados.usuarios.erros.push(`Linha ${linha} (${email}): senha muito curta (mínimo 6 caracteres).`);
        continue;
      }

      const roleRaw = str(row["role\n(ADMIN|GESTOR_PORTFOLIO|ENGENHEIRO|MESTRE_OBRA|APROVADOR|ELABORADOR|VISUALIZADOR)"] ?? row["role"]).toUpperCase();
      const role = ROLES_VALIDAS.has(roleRaw) ? roleRaw : "ELABORADOR";

      try {
        const exists = await prisma.usuario.findUnique({ where: { email } });
        if (exists) {
          resultados.usuarios.pulados++;
          continue;
        }
        const hash = await bcrypt.hash(senha, 10);
        await prisma.usuario.create({
          data: {
            nome,
            email,
            senha: hash,
            cargo:    str(row["cargo"]) || null,
            registro: str(row["registro"]) || null,
            telefone: str(row["telefone"]) || null,
            role,
          },
        });
        resultados.usuarios.importados++;
      } catch (e) {
        resultados.usuarios.erros.push(`Linha ${linha} (${email}): erro ao salvar — ${(e as Error).message}`);
      }
    }
  }

  return NextResponse.json({ ok: true, resultados });
}
