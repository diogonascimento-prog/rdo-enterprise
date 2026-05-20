import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(data: Date | string, padrao = "dd/MM/yyyy") {
  return format(new Date(data), padrao, { locale: ptBR });
}

export function formatarDataHora(data: Date | string) {
  return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function gerarCaminhoSharepoint(
  nomeObra: string,
  data: Date,
  atividade: string
): string {
  const dataFormatada = format(data, "yyyy-MM-dd");
  const atividadeSlug = atividade
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // remove acentos
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const obraSlug = nomeObra
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `${obraSlug}/${dataFormatada}_${atividadeSlug}`;
}

export function calcularTotalHH(
  quantidade: number,
  horasTrabalhadas: number,
  horasExtras: number
) {
  return quantidade * (horasTrabalhadas + horasExtras);
}
