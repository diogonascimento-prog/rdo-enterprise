"use client";

import { useState, useRef } from "react";
import {
  Upload, Download, FileSpreadsheet, CheckCircle,
  AlertTriangle, X, Loader2, HardHat, Users,
} from "lucide-react";

interface Resultados {
  obras:    { importados: number; pulados: number; erros: string[] };
  usuarios: { importados: number; pulados: number; erros: string[] };
}

export function ImportarExcel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultados | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setArquivo(f);
    setResultado(null);
    setErro(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setArquivo(f);
      setResultado(null);
      setErro(null);
    }
  }

  async function handleImportar() {
    if (!arquivo) return;
    setEnviando(true);
    setErro(null);
    setResultado(null);
    try {
      const fd = new FormData();
      fd.append("file", arquivo);
      const res = await fetch("/api/importar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setResultado(data.resultados);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const totalImportados = (resultado?.obras.importados ?? 0) + (resultado?.usuarios.importados ?? 0);
  const totalErros = (resultado?.obras.erros.length ?? 0) + (resultado?.usuarios.erros.length ?? 0);

  return (
    <div className="space-y-6">
      {/* Passo 1: Download do template */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="bg-green-50 p-3 rounded-xl shrink-0">
            <Download className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 mb-1">Passo 1 — Baixe a planilha modelo</h2>
            <p className="text-sm text-slate-500 mb-4">
              A planilha já vem com as abas <strong>Obras</strong> e <strong>Usuários</strong> prontas,
              com exemplos e instruções de preenchimento.
            </p>
            <a
              href="/api/importar/template"
              download
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Baixar modelo_importacao_rdo.xlsx
            </a>
          </div>
        </div>
      </div>

      {/* Passo 2: Preencher e enviar */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="bg-orange-50 p-3 rounded-xl shrink-0">
            <Upload className="w-5 h-5 text-brand-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 mb-1">Passo 2 — Envie a planilha preenchida</h2>
            <p className="text-sm text-slate-500 mb-4">
              Após preencher, faça o upload. Registros com código ou e-mail já existente são pulados automaticamente.
            </p>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${arquivo ? "border-brand-orange bg-orange-50" : "border-slate-200 hover:border-orange-200 hover:bg-orange-50/30"}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleArquivo}
              />
              {arquivo ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-brand-orange" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800 text-sm">{arquivo.name}</p>
                    <p className="text-xs text-slate-400">{(arquivo.size / 1024).toFixed(0)} KB · clique para trocar</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setArquivo(null); setResultado(null); if (inputRef.current) inputRef.current.value = ""; }}
                    className="ml-2 p-1 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Clique ou arraste o arquivo aqui</p>
                  <p className="text-xs text-slate-400 mt-1">Aceita .xlsx ou .xls</p>
                </>
              )}
            </div>

            {arquivo && !resultado && (
              <button
                onClick={handleImportar}
                disabled={enviando}
                className="mt-4 inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
              >
                {enviando ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Importando…</>
                ) : (
                  <><Upload className="w-4 h-4" /> Importar dados</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Erro global */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Erro ao importar</p>
            <p className="text-sm text-red-600 mt-0.5">{erro}</p>
          </div>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className={`border rounded-2xl p-5 flex items-start gap-3 ${totalErros === 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
            {totalErros === 0
              ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            }
            <div>
              <p className={`font-bold ${totalErros === 0 ? "text-green-800" : "text-amber-800"}`}>
                {totalImportados > 0
                  ? `${totalImportados} registro${totalImportados !== 1 ? "s" : ""} importado${totalImportados !== 1 ? "s" : ""} com sucesso!`
                  : "Nenhum novo registro importado"}
              </p>
              {totalErros > 0 && (
                <p className="text-sm text-amber-700 mt-0.5">{totalErros} erro{totalErros !== 1 ? "s" : ""} encontrado{totalErros !== 1 ? "s" : ""}. Veja detalhes abaixo.</p>
              )}
            </div>
          </div>

          {/* Detalhes por aba */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultadoAba
              icon={HardHat}
              titulo="Obras"
              importados={resultado.obras.importados}
              pulados={resultado.obras.pulados}
              erros={resultado.obras.erros}
            />
            <ResultadoAba
              icon={Users}
              titulo="Usuários"
              importados={resultado.usuarios.importados}
              pulados={resultado.usuarios.pulados}
              erros={resultado.usuarios.erros}
            />
          </div>

          <div className="flex gap-3">
            <a href="/portfolio" className="btn-primary text-sm">Ver Dashboard Geral →</a>
            <button
              onClick={() => { setArquivo(null); setResultado(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Importar outro arquivo
            </button>
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
        <h3 className="font-semibold text-slate-700 mb-3 text-sm">O que pode ser importado?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: HardHat, titulo: "Obras", itens: ["Nome e código", "Cliente e responsável técnico", "Endereço completo", "Datas e orçamento", "Status inicial"] },
            { icon: Users,   titulo: "Usuários", itens: ["Nome e e-mail", "Senha inicial (criptografada)", "Cargo e registro profissional", "Nível de acesso (role)", "Telefone de contato"] },
          ].map(({ icon: Icon, titulo, itens }) => (
            <div key={titulo} className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <p className="font-semibold text-slate-700 text-sm">{titulo}</p>
              </div>
              <ul className="space-y-1">
                {itens.map(item => (
                  <li key={item} className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-brand-orange shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultadoAba({
  icon: Icon, titulo, importados, pulados, erros,
}: {
  icon: React.ElementType;
  titulo: string;
  importados: number;
  pulados: number;
  erros: string[];
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-500" />
        <p className="font-bold text-slate-800 text-sm">{titulo}</p>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-slate-600">{importados} importado{importados !== 1 ? "s" : ""}</span>
        </div>
        {pulados > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-slate-400 shrink-0">⟳</span>
            <span className="text-slate-400">{pulados} já existia{pulados !== 1 ? "m" : ""} (pulado{pulados !== 1 ? "s" : ""})</span>
          </div>
        )}
        {erros.length > 0 && (
          <div className="mt-2 space-y-1">
            {erros.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
