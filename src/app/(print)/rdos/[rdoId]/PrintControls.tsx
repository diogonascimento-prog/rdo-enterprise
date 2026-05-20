"use client";

export function PrintControls() {
  return (
    <div style={{ position: "fixed", top: 16, left: 16, zIndex: 50, display: "flex", gap: 8 }}
      className="no-print">
      <button
        onClick={() => window.history.back()}
        style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
      >
        ← Voltar
      </button>
      <button
        onClick={() => window.print()}
        style={{ background: "#E8500D", color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: "bold", cursor: "pointer" }}
      >
        🖨️ Imprimir / Salvar PDF
      </button>
    </div>
  );
}
