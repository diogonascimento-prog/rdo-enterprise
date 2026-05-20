import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "full" | "icon" | "white";
}

export function LogoEngetecnica({ className, iconOnly = false, variant = "full" }: LogoProps) {
  const darkColor  = variant === "white" ? "#FFFFFF" : "#2B2B2B";
  const orangeColor = "#E8500D";

  const Icon = () => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Anel externo laranja */}
      <circle cx="18" cy="18" r="17" stroke={orangeColor} strokeWidth="2.2" fill="none" />
      {/* Anel interno escuro */}
      <circle cx="14" cy="18" r="11" stroke={darkColor} strokeWidth="2" fill="none" />
      {/* Linhas horizontais (ícone de documento/engenharia) */}
      <line x1="10" y1="13" x2="22" y2="13" stroke={darkColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="18" x2="22" y2="18" stroke={darkColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="23" x2="19" y2="23" stroke={darkColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  if (iconOnly) return <Icon />;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Icon />
      <span className="font-black text-xl tracking-tight leading-none">
        <span style={{ color: darkColor }}>ENGET</span>
        <span style={{ color: orangeColor }}>ECNICA</span>
      </span>
    </div>
  );
}

/** Versão compacta para sidebar */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="17" stroke="#E8500D" strokeWidth="2.2" fill="none" />
        <circle cx="14" cy="18" r="11" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <line x1="10" y1="13" x2="22" y2="13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="18" x2="22" y2="18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="23" x2="19" y2="23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="font-black text-sm tracking-tight leading-none">
        <span className="text-white">ENGET</span>
        <span className="text-brand-orange">ECNICA</span>
      </span>
    </div>
  );
}
