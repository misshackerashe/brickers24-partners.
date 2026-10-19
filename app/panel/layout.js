import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import Nav from "./nav";

export const dynamic = "force-dynamic";

function initials(name) {
  if (!name) return "BP";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function PanelLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pu } = await supabase
    .from("partner_users")
    .select("nombre, email, rol, partners(nombre, ciudad, pais)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const agencyName = pu?.partners?.nombre || "Sin agencia asignada";
  const agencyCity = pu?.partners?.ciudad || "";
  const userName = pu?.nombre || user.email;

  return (
    <div className="app">
      <div className="topbar">
        <span className="logo">brickers<span className="t">24</span><small>Partners</small></span>
        <div className="agency">Inmobiliaria<b>{agencyName}{agencyCity ? ` · ${agencyCity}` : ""}</b></div>
        <div className="spacer" />
        <div className="usermenu">
          <div className="who">
            <b>{userName}</b>
            <span>{pu?.rol === "owner" ? "Responsable" : "Agente"}</span>
          </div>
          <div className="avatar">{initials(pu?.nombre || user.email)}</div>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost btn-sm" type="submit">Salir</button>
          </form>
        </div>
      </div>
      <div className="shell">
        <aside className="sidebar"><Nav /></aside>
        <main className="main">{children}</main>
      </div>
      <div className="badge-demo">Entorno de pruebas</div>
    </div>
  );
}
