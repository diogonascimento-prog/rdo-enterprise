import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;

  return (
    <div className="flex min-h-screen" style={{ background: "#F4F6FA" }}>
      <Sidebar userName={user?.name ?? "Usuário"} userEmail={user?.email ?? ""} userRole={user?.role ?? ""} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
        <footer className="px-8 py-3.5 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <p className="text-xs text-slate-400">
            <span className="font-bold text-gradient-orange">ENGETECNICA</span>
            {" "}— RDO Enterprise <span className="text-slate-300">v0.1.0</span>
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs text-slate-400">Sistema operacional</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
