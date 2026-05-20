import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatarData } from "@/lib/utils";
import { AutoPrint } from "./AutoPrint";
import { PrintControls } from "./PrintControls";

export default async function ImprimirRdoPage({
  params,
}: {
  params: { rdoId: string };
}) {
  const rdo = await prisma.rdo.findUnique({
    where: { id: params.rdoId },
    include: {
      obra: { select: { nome: true, codigo: true, responsavelTecnico: true, cliente: true } },
      elaborador: { select: { nome: true, cargo: true } },
      aprovador: { select: { nome: true, cargo: true } },
      clima: { orderBy: { periodo: "asc" } },
      maoDeObra: true,
      equipamentos: true,
      atividades: true,
      materiais: true,
      ocorrencias: true,
    },
  });

  if (!rdo) notFound();

  const CLIMA_LABEL: Record<string, string> = {
    BOM: "Bom", NUBLADO: "Nublado", CHUVA_LEVE: "Chuva leve",
    CHUVA_FORTE: "Chuva forte", IMPRATICAVEL: "Impraticável",
    VENTANIA: "Ventania", NEBLINA: "Neblina",
  };
  const PERIODO_LABEL: Record<string, string> = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite" };
  const TURNO_LABEL: Record<string, string> = { DIURNO: "Diurno", NOTURNO: "Noturno", INTEGRAL: "Integral" };
  const GRAVIDADE_LABEL: Record<string, string> = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta", CRITICA: "Crítica" };

  const totalPessoas = rdo.maoDeObra.reduce((a, m) => a + m.quantidade, 0);
  const totalHH = rdo.maoDeObra.reduce((a, m) => a + m.quantidade * (m.horasTrabalhadas + m.horasExtras), 0);

  const thS: React.CSSProperties = {
    padding: "2mm 3mm", textAlign: "left", fontSize: "8pt",
    fontWeight: "bold", border: "1px solid #e2e8f0",
    color: "white", background: "#1e293b",
  };
  const tdS: React.CSSProperties = {
    padding: "2mm 3mm", fontSize: "9pt",
    border: "1px solid #e2e8f0", verticalAlign: "top",
  };
  const secTitle: React.CSSProperties = {
    fontSize: "8pt", fontWeight: "900", letterSpacing: "0.08em",
    textTransform: "uppercase", color: "white", background: "#E8500D",
    padding: "2mm 4mm", marginBottom: "2mm",
  };

  function Sec({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div style={{ marginBottom: "5mm" }}>
        <div style={secTitle}>{title}</div>
        {children}
      </div>
    );
  }

  return (
    <>
      <AutoPrint />
      <style>{`
        @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #1e293b; background: white; }
      `}</style>

      <PrintControls />

      <div style={{ maxWidth: "210mm", margin: "0 auto", padding: "16mm 0 10mm", background: "white" }}>

        {/* ── CABEÇALHO ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "60%", verticalAlign: "top" }}>
                <div style={{ fontSize: "7pt", fontWeight: "bold", color: "#E8500D", letterSpacing: "0.05em", marginBottom: "2mm" }}>
                  ENGETECNICA ENGENHARIA E CONSTRUÇÃO
                </div>
                <div style={{ fontSize: "14pt", fontWeight: "900", color: "#0f172a", lineHeight: 1.2 }}>
                  RELATÓRIO DIÁRIO DE OBRA
                </div>
                <div style={{ fontSize: "8pt", color: "#64748b", marginTop: "2mm" }}>
                  {rdo.obra.nome}
                  {rdo.obra.cliente && <> · {rdo.obra.cliente}</>}
                </div>
              </td>
              <td style={{ width: "40%", verticalAlign: "top", textAlign: "right" }}>
                <div style={{ display: "inline-block", border: "1.5px solid #E8500D", borderRadius: 6, padding: "3mm 5mm" }}>
                  <div style={{ fontSize: "7pt", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>RDO</div>
                  <div style={{ fontSize: "22pt", fontWeight: "900", color: "#E8500D", lineHeight: 1 }}>
                    #{String(rdo.numero).padStart(3, "0")}
                  </div>
                  <div style={{ fontSize: "8pt", color: "#1e293b", marginTop: "1mm", fontWeight: "bold" }}>
                    {formatarData(rdo.data)}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ height: "2px", background: "linear-gradient(to right, #E8500D, #f97316, transparent)", marginBottom: "5mm" }} />

        {/* ── INFO BÁSICA ── */}
        <Sec title="Identificação">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={thS}>Obra</th><th style={thS}>Código</th><th style={thS}>Data</th><th style={thS}>Turno</th><th style={thS}>Elaborador</th><th style={thS}>Status</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdS}>{rdo.obra.nome}</td>
                <td style={tdS}>{rdo.obra.codigo}</td>
                <td style={tdS}>{formatarData(rdo.data)}</td>
                <td style={tdS}>{TURNO_LABEL[rdo.turno] ?? rdo.turno}</td>
                <td style={tdS}>{rdo.elaborador.nome}</td>
                <td style={{ ...tdS, fontWeight: "bold", color: rdo.status === "APROVADO" ? "#16a34a" : "#b45309" }}>
                  {rdo.status === "APROVADO" ? "Aprovado" : rdo.status === "PENDENTE_APROVACAO" ? "Pend. Aprovação" : rdo.status}
                </td>
              </tr>
            </tbody>
          </table>
        </Sec>

        {/* ── CLIMA ── */}
        {rdo.clima.length > 0 && (
          <Sec title="Condições Climáticas">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f1f5f9" }}>
                <th style={thS}>Período</th><th style={thS}>Condição</th>
                <th style={{ ...thS, textAlign: "center" }}>Temp. (°C)</th>
                <th style={{ ...thS, textAlign: "center" }}>Umidade (%)</th>
                <th style={thS}>Observação</th>
              </tr></thead>
              <tbody>
                {rdo.clima.map((c, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={tdS}>{PERIODO_LABEL[c.periodo] ?? c.periodo}</td>
                    <td style={tdS}>{CLIMA_LABEL[c.condicao] ?? c.condicao}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{c.temperatura ?? "—"}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{(c as any).umidade ?? "—"}</td>
                    <td style={tdS}>{(c as any).observacao || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sec>
        )}

        {/* ── MÃO DE OBRA ── */}
        {rdo.maoDeObra.length > 0 && (
          <Sec title={`Mão de Obra — ${totalPessoas} pessoas | ${totalHH.toFixed(0)} HH`}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thS}>Função</th><th style={thS}>Tipo</th><th style={thS}>Empresa</th>
                <th style={{ ...thS, textAlign: "center" }}>Qtd</th>
                <th style={{ ...thS, textAlign: "center" }}>H. Trab.</th>
                <th style={{ ...thS, textAlign: "center" }}>H. Extra</th>
                <th style={{ ...thS, textAlign: "center" }}>HH Total</th>
              </tr></thead>
              <tbody>
                {rdo.maoDeObra.map((m, i) => {
                  const hh = m.quantidade * (m.horasTrabalhadas + m.horasExtras);
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                      <td style={tdS}>{m.funcaoDescricao || m.funcao}</td>
                      <td style={tdS}>{m.tipo === "PROPRIO" ? "Próprio" : "Terceirizado"}</td>
                      <td style={tdS}>{m.empresa || "—"}</td>
                      <td style={{ ...tdS, textAlign: "center", fontWeight: "bold" }}>{m.quantidade}</td>
                      <td style={{ ...tdS, textAlign: "center" }}>{m.horasTrabalhadas}h</td>
                      <td style={{ ...tdS, textAlign: "center" }}>{m.horasExtras > 0 ? `${m.horasExtras}h` : "—"}</td>
                      <td style={{ ...tdS, textAlign: "center", fontWeight: "bold" }}>{hh}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Sec>
        )}

        {/* ── EQUIPAMENTOS ── */}
        {rdo.equipamentos.length > 0 && (
          <Sec title="Equipamentos">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thS}>Equipamento</th><th style={thS}>Modelo</th>
                <th style={{ ...thS, textAlign: "center" }}>Qtd</th>
                <th style={{ ...thS, textAlign: "center" }}>H. Oper.</th>
                <th style={{ ...thS, textAlign: "center" }}>H. Parada</th>
                <th style={thS}>Motivo Parada</th>
              </tr></thead>
              <tbody>
                {rdo.equipamentos.map((e, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={tdS}>{e.nome}</td><td style={tdS}>{e.modelo || "—"}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{e.quantidade}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{e.horasOperadas}h</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{e.horasParadas > 0 ? `${e.horasParadas}h` : "—"}</td>
                    <td style={tdS}>{e.motivoParada || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sec>
        )}

        {/* ── ATIVIDADES ── */}
        {rdo.atividades.length > 0 && (
          <Sec title="Atividades Executadas">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thS}>Descrição</th><th style={thS}>Frente</th><th style={thS}>Unidade</th>
                <th style={{ ...thS, textAlign: "center" }}>Qtd Prev.</th>
                <th style={{ ...thS, textAlign: "center" }}>Qtd Real.</th>
                <th style={{ ...thS, textAlign: "center" }}>Avanço</th>
              </tr></thead>
              <tbody>
                {rdo.atividades.map((a, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={tdS}>{a.descricao}</td>
                    <td style={tdS}>{a.frente || "—"}</td>
                    <td style={tdS}>{a.unidade || "—"}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{a.quantidadePrevista ?? "—"}</td>
                    <td style={{ ...tdS, textAlign: "center", fontWeight: "bold" }}>{a.quantidadeRealizada ?? "—"}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{a.percentualAvancoDia != null ? `${a.percentualAvancoDia}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sec>
        )}

        {/* ── MATERIAIS ── */}
        {rdo.materiais.length > 0 && (
          <Sec title="Materiais Recebidos">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thS}>Descrição</th>
                <th style={{ ...thS, textAlign: "center" }}>Quantidade</th>
                <th style={thS}>Unidade</th><th style={thS}>Fornecedor</th><th style={thS}>NF</th>
              </tr></thead>
              <tbody>
                {rdo.materiais.map((m, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={tdS}>{m.descricao}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>{m.quantidade}</td>
                    <td style={tdS}>{m.unidade || "—"}</td>
                    <td style={tdS}>{m.fornecedor || "—"}</td>
                    <td style={tdS}>{m.notaFiscal || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sec>
        )}

        {/* ── OCORRÊNCIAS ── */}
        {rdo.ocorrencias.length > 0 && (
          <Sec title={`Ocorrências (${rdo.ocorrencias.length})`}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thS}>Tipo</th><th style={thS}>Gravidade</th>
                <th style={thS}>Descrição</th><th style={thS}>Impacto</th>
                <th style={thS}>Ação Imediata</th><th style={thS}>Responsável</th>
              </tr></thead>
              <tbody>
                {rdo.ocorrencias.map((o, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fff7ed" }}>
                    <td style={tdS}>{o.tipo}</td>
                    <td style={{ ...tdS, fontWeight: "bold", color: o.gravidade === "CRITICA" ? "#dc2626" : "#b45309" }}>
                      {GRAVIDADE_LABEL[o.gravidade] ?? o.gravidade}
                    </td>
                    <td style={tdS}>{o.descricao}</td>
                    <td style={tdS}>{o.impacto || "—"}</td>
                    <td style={tdS}>{o.acaoImediata || "—"}</td>
                    <td style={tdS}>{o.responsavel || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sec>
        )}

        {/* ── OBSERVAÇÕES ── */}
        {rdo.observacaoGeral && (
          <Sec title="Observações Gerais">
            <p style={{ fontSize: "10pt", lineHeight: 1.6, padding: "3mm 4mm", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 3 }}>
              {rdo.observacaoGeral}
            </p>
          </Sec>
        )}

        {/* ── ASSINATURAS ── */}
        <div style={{ marginTop: "12mm" }}>
          <div style={secTitle}>Assinaturas</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2mm" }}>
            <tbody>
              <tr>
                {[
                  { label: "Elaborado por", nome: rdo.elaborador.nome, cargo: rdo.elaborador.cargo },
                  { label: "Aprovado por", nome: rdo.aprovador?.nome ?? "", cargo: rdo.aprovador?.cargo ?? "" },
                  { label: "Responsável Técnico", nome: rdo.obra.responsavelTecnico ?? "", cargo: "Eng. Responsável" },
                ].map(({ label, nome, cargo }) => (
                  <td key={label} style={{ width: "33%", padding: "0 5mm", textAlign: "center" }}>
                    <div style={{ borderTop: "1px solid #1e293b", paddingTop: "2mm", marginTop: "12mm" }}>
                      <div style={{ fontSize: "9pt", fontWeight: "bold" }}>{nome || "___________________"}</div>
                      <div style={{ fontSize: "8pt", color: "#64748b" }}>{cargo || ""}</div>
                      <div style={{ fontSize: "7pt", color: "#94a3b8", marginTop: "1mm" }}>{label}</div>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── RODAPÉ ── */}
        <div style={{ marginTop: "8mm", borderTop: "1px solid #e2e8f0", paddingTop: "3mm", display: "flex", justifyContent: "space-between", fontSize: "7pt", color: "#94a3b8" }}>
          <span>RDO Enterprise — ENGETECNICA Engenharia e Construção</span>
          <span>Gerado em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

      </div>
    </>
  );
}
