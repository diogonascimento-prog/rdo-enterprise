import { redirect } from "next/navigation";

// Redireciona raiz → listagem de obras
export default function Home() {
  redirect("/obras");
}
