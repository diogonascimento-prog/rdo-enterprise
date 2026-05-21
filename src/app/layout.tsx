import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "RDO Enterprise",
    template: "%s | RDO Enterprise",
  },
  description: "Sistema de Relatório Diário de Obra — Gestão e Analytics",
  manifest: "/manifest.json",
  themeColor: "#E8500D",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RDO Enterprise",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
