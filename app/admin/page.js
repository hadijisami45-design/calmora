import { redirect } from "next/navigation";
import { adminConnecte } from "@/lib/session";
import Tableau from "./Tableau";
import AvisAdmin from "./AvisAdmin";

export const dynamic = "force-dynamic";

export default async function PageAdmin() {
  const admin = await adminConnecte();
  if (!admin) redirect("/admin/login");
  return (
    <>
      <Tableau utilisateur={admin.username} />
      <AvisAdmin />
    </>
  );
}
