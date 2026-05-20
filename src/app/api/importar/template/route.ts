import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const wb = XLSX.utils.book_new();

  // ── Aba OBRAS ──────────────────────────────────────────────────────────────
  const obrasHeader = [
    ["nome*", "codigo*", "cliente", "responsavelTecnico", "art",
     "endereco", "cidade", "estado", "cep",
     "dataInicio*\n(DD/MM/AAAA)", "dataFimPrevisto*\n(DD/MM/AAAA)",
     "orcamentoTotal", "areaTotal",
     "status\n(PLANEJAMENTO|EM_ANDAMENTO|PARALISADA|CONCLUIDA|CANCELADA)",
     "descricao"],
  ];
  const obrasExemplo = [
    ["Edificio Comercial Centro", "OBR-2024-001", "Cliente SA", "Eng. João Silva", "ART-12345",
     "Rua das Flores, 100", "São Paulo", "SP", "01001-000",
     "01/03/2024", "31/12/2024",
     "1500000", "850",
     "EM_ANDAMENTO",
     "Torre comercial 12 andares"],
    ["Residencial Parque Verde", "OBR-2024-002", "Construtora ABC", "Eng. Maria Santos", "",
     "Av. Brasil, 500", "Campinas", "SP", "13001-000",
     "15/04/2024", "30/06/2025",
     "3200000", "2200",
     "PLANEJAMENTO",
     "Condomínio residencial 40 unidades"],
  ];
  const wsObras = XLSX.utils.aoa_to_sheet([...obrasHeader, ...obrasExemplo]);
  wsObras["!cols"] = [
    { wch: 30 }, { wch: 16 }, { wch: 20 }, { wch: 22 }, { wch: 14 },
    { wch: 28 }, { wch: 16 }, { wch: 6 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 36 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsObras, "Obras");

  // ── Aba USUARIOS ───────────────────────────────────────────────────────────
  const usuariosHeader = [
    ["nome*", "email*", "senha_inicial*", "cargo", "registro", "telefone",
     "role\n(ADMIN|GESTOR_PORTFOLIO|ENGENHEIRO|MESTRE_OBRA|APROVADOR|ELABORADOR|VISUALIZADOR)"],
  ];
  const usuariosExemplo = [
    ["João da Silva", "joao.silva@engetecnica.com.br", "Senha@123", "Engenheiro Civil", "CREA-SP 123456", "(11) 99999-0001", "ENGENHEIRO"],
    ["Maria Oliveira", "maria.oliveira@engetecnica.com.br", "Senha@123", "Mestre de Obras", "", "(11) 99999-0002", "MESTRE_OBRA"],
    ["Carlos Admin",  "carlos.admin@engetecnica.com.br",  "Senha@123", "Gestor de Portfólio", "", "", "GESTOR_PORTFOLIO"],
  ];
  const wsUsuarios = XLSX.utils.aoa_to_sheet([...usuariosHeader, ...usuariosExemplo]);
  wsUsuarios["!cols"] = [
    { wch: 26 }, { wch: 34 }, { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 36 },
  ];
  XLSX.utils.book_append_sheet(wb, wsUsuarios, "Usuarios");

  // ── Aba INSTRUCOES ─────────────────────────────────────────────────────────
  const instrucoes = [
    ["INSTRUÇÕES DE PREENCHIMENTO"],
    [""],
    ["Campos com * são obrigatórios."],
    [""],
    ["ABA OBRAS:"],
    ["  • nome: Nome completo da obra"],
    ["  • codigo: Código único (ex: OBR-2024-001). Não pode repetir."],
    ["  • dataInicio / dataFimPrevisto: formato DD/MM/AAAA"],
    ["  • status: use exatamente um dos valores indicados no cabeçalho (padrão: PLANEJAMENTO)"],
    ["  • orcamentoTotal / areaTotal: apenas números, sem R$ ou m²"],
    [""],
    ["ABA USUARIOS:"],
    ["  • email: deve ser único. Usuário fará login com este e-mail."],
    ["  • senha_inicial: mínimo 6 caracteres. Usuário poderá alterar depois."],
    ["  • role: nível de acesso no sistema (padrão: ELABORADOR)"],
    [""],
    ["DICAS:"],
    ["  • Não altere os cabeçalhos das colunas"],
    ["  • Não misture abas — cada aba tem seu próprio tipo de dado"],
    ["  • Você pode importar só Obras, só Usuários, ou ambos ao mesmo tempo"],
    ["  • Linhas em branco são ignoradas automaticamente"],
    ["  • Em caso de email ou código já existente, o registro é pulado (sem erro)"],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instrucoes);
  wsInstr["!cols"] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instrucoes");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="modelo_importacao_rdo.xlsx"',
    },
  });
}
