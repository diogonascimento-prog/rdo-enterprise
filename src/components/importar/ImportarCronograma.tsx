"use client";

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Upload, FileSpreadsheet, X, Loader2, CheckCircle,
  AlertTriangle, ChevronRight, Layers, ListChecks,
} from "lucide-react";

interface Obra {
  id: string;
  nome: string;
  codigo: string;
  status: string;
}

interface Tarefa {
  wbs: string;
  descricao: string;
  etapa: boolean;
  unidade: string | null;
  quantidadeTotal: number | null;
  pesoRelativo: number;
  depth: number;
}

function wbsDepth(wbs: string): number {
  const parts = wbs.split(".");
  if (parts.length === 1) return 0;
  if (parts.length === 2 && parts[1] === "0") return 0;
  return parts.length - 1;
}

function parseXlsx(file: File): Promise<Tarefa[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          header: 1,
          defval: "",
        }) as unknown[][];

        // find header row (contains ITEM or DESCRICAO)
        let headerIdx = 0;
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const row = rows[i] as string[];
          if (row.some((c) => String(c).toUpperCase().includes("ITEM") || String(c).toUpperCase().includes("DESCRI"))) {
            headerIdx = i;
            break;
          }
        }

        const header = (rows[headerIdx] as string[]).map((h) => String(h).toUpperCase().trim());
        const colItem   = header.findIndex((h) => h.includes("ITEM"));
        const colDesc   = header.findIndex((h) => h.includes("DESCRI"));
        const colEtapa  = header.findIndex((h) => h.includes("ETAPA"));
        const colUnid   = header.findIndex((h) => h.includes("UNID"));
        const colPrev   = header.findIndex((h) => h.includes("PREVISTO") || h.includes("PREV"));
        const colPeso   = header.findIndex((h) => h.includes("PERCENT") || h.includes("PESO"));

        const tarefas: Tarefa[] = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i] as unknown[];
          const wbs   = String(row[colItem] ?? "").trim();
          const desc  = String(row[colDesc] ?? "").trim();
          if (!wbs || !desc) continue;

          const etapaVal = colEtapa >= 0 ? String(row[colEtapa] ?? "").toLowerCase().trim() : "";
          const isEtapa  = etapaVal === "etapa";

          const quantRaw = colPrev >= 0 ? row[colPrev] : null;
          const pesoRaw  = colPeso >= 0 ? row[colPeso] : null;
          const quant    = quantRaw !== null && quantRaw !== "" ? parseFloat(String(quantRaw)) : null;
          const peso     = pesoRaw  !== null && pesoRaw  !== "" ? parseFloat(String(pesoRaw))  : 0;

          tarefas.push({
            wbs,
            descricao:      desc.replace(/\s+/g, " ").trim(),
            etapa:          isEtapa,
            unidade:        colUnid >= 0 && row[colUnid] ? String(row[colUnid]).trim() || null : null,
            quantidadeTotal: !isNaN(quant!) ? quant : null,
            pesoRelativo:   isNaN(peso) ? 0 : peso,
            depth:          wbsDepth(wbs),
          });
        }
        resolve(tarefas);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

const DEPTH_STYLES: Record<number, { bg: string; text: string; font: string; indent: string }> = {
  0: { bg: "bg-slate-800", text: "text-white",      font: "font-bold",     indent: "pl-3" },
  1: { bg: "bg-slate-100", text: "text-slate-700",  font: "font-semibold", indent: "pl-7" },
  2: { bg: "bg-white",     text: "text-slate-600",  font: "font-normal",   indent: "pl-12" },
  3: { bg: "bg-white",     text: "text-slate-500",  font: "font-normal",   indent: "pl-16" },
};

function getStyle(depth: number) {
  return DEPTH_STYLES[Math.min(depth, 3)];
}

export function ImportarCronograma() {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo]   = useState<File | null>(null);
  const [tarefas, setTarefas]   = useState<Tarefa[]>([]);
  const [obras,   setObras]     = useState<Obra[]>([]);
  const [obraId,  setObraId]    = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ importados: number } | null>(null);
  const [erro,    setErro]      = useState<string | null>(null);
  const [parsing, setParsing]   = useState(false);

  useEffect(() => {
    fetch("/api/obras")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setObras(data); })
      .catch(() => {});
  }, []);

  async function handleArquivo(file: File) {
    setArquivo(file);
    setTarefas([]);
    setResultado(null);
    setErro(null);
    setParsing(true);
    try {
      const lista = await parseXlsx(file);
      setTarefas(lista);
    } catch {
      setErro("Não foi possível ler o arquivo. Verifique se é um .xlsx válido.");
    } finally {
      setParsing(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleArquivo(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) handleArquivo(f);
  }

  async function handleImportar() {
    if (!obraId) { setErro("Selecione a obra antes de importar."); return; }
    if (!tarefas.length) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/cronograma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obraId, tarefas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setResultado({ importados: data.importados });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const grupos  = tarefas.filter((t) => t.etapa).length;
  const itens   = tarefas.filter((t) => !t.etapa).length;

  return (
    <div className="space-y-5">

      {/* Upload */}
      <div className="bg-white rounded-2xl p-6 space-y-4"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shrink-0"
            style={{ background: "linear-gradient(135deg,#7C3AED,#A855F7)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}>
            <ListChecks className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Importar Cronograma / Lista de Tarefas</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Colunas esperadas: <span className="font-mono">ITEM · DESCRICAO · ETAPA · UNIDADE · PREVISTO · PORCENTAGEM</span>
            </p>
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !arquivo && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors
            ${arquivo ? "border-purple-300 bg-purple-50/40 cursor-default" : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 cursor-pointer"}`}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleInput} />

          {parsing ? (
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Lendo planilha…</span>
            </div>
          ) : arquivo ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <p className="font-semibold text-slate-800 text-sm">{arquivo.name}</p>
                <p className="text-xs text-slate-400">{(arquivo.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setArquivo(null);
                  setTarefas([]);
                  setResultado(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="ml-2 p-1 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Clique ou arraste o arquivo aqui</p>
              <p className="text-xs text-slate-400 mt-1">Aceita .xlsx ou .xls</p>
            </>
          )}
        </div>

        {/* Resumo do arquivo lido */}
        {tarefas.length > 0 && !resultado && (
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-700">{grupos}</strong> grupos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-700">{itens}</strong> tarefas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-300">·</span>
              <strong className="text-slate-700">{tarefas.length}</strong> itens no total
            </span>
          </div>
        )}
      </div>

      {/* Preview da lista de tarefas */}
      {tarefas.length > 0 && !resultado && (
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          {/* Header da tabela */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-0 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right pr-8">Unidade</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right w-20">Previsto</span>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
            {tarefas.map((t, i) => {
              const s = getStyle(t.depth);
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_auto_auto] items-center gap-0 px-4 py-1.5 ${s.bg}
                    ${i !== tarefas.length - 1 ? "border-b border-slate-100/60" : ""}`}
                >
                  <div className={`flex items-center gap-2 ${s.indent}`}>
                    {t.etapa ? (
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${t.depth === 0 ? "text-white/70" : "text-slate-400"}`} />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.depth === 0 ? "bg-white/50" : "bg-slate-300"}`} />
                    )}
                    <span className={`font-mono text-[10px] shrink-0 ${t.depth === 0 ? "text-white/60" : "text-slate-400"}`}>
                      {t.wbs}
                    </span>
                    <span className={`text-xs ${s.font} ${s.text} truncate`}>{t.descricao}</span>
                  </div>
                  <span className={`text-[10px] text-right pr-8 ${t.depth === 0 ? "text-white/50" : "text-slate-400"}`}>
                    {t.unidade ?? "—"}
                  </span>
                  <span className={`text-[10px] text-right w-20 ${t.depth === 0 ? "text-white/50" : "text-slate-400"}`}>
                    {t.quantidadeTotal != null ? t.quantidadeTotal : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seletor de obra + botão importar */}
      {tarefas.length > 0 && !resultado && (
        <div className="bg-white rounded-2xl p-5"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <label className="label">Vincular à obra *</label>
          <select
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            className="input mb-4"
          >
            <option value="">— Selecione a obra —</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.codigo} · {o.nome}
              </option>
            ))}
          </select>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
              {erro}
            </p>
          )}

          <button
            onClick={handleImportar}
            disabled={enviando || !obraId}
            className="btn-primary disabled:opacity-50"
            style={{ background: enviando || !obraId ? undefined : "linear-gradient(135deg,#7C3AED,#A855F7)", boxShadow: "0 2px 8px rgba(124,58,237,0.30)" }}
          >
            {enviando ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Importando…</>
            ) : (
              <><ListChecks className="w-4 h-4" /> Importar {tarefas.length} itens</>
            )}
          </button>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-800">
              {resultado.importados} tarefa{resultado.importados !== 1 ? "s" : ""} importada{resultado.importados !== 1 ? "s" : ""} com sucesso!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Acesse o dashboard da obra para ver o cronograma atualizado.
            </p>
            <button
              onClick={() => { setArquivo(null); setTarefas([]); setResultado(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="mt-3 text-xs font-semibold text-green-700 underline"
            >
              Importar outro arquivo
            </button>
          </div>
        </div>
      )}

      {erro && !tarefas.length && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}
    </div>
  );
}
