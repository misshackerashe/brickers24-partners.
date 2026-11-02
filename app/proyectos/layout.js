import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function initials(name) {
  if (!name) return "BP";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function ProyectosLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pu } = await supabase
    .from("partner_users")
    .select("nombre, partners(nombre, ciudad)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const agencyName = pu?.partners?.nombre || "Brickers24";
  const agencyCity = pu?.partners?.ciudad || "";
  const userName = pu?.nombre || user.email;

  return (
    <div className="app">
      <div className="topbar">
        <a className="logo" href="/panel">brickers<span className="t">24</span><small>Partners</small></a>
        <div className="agency">Inmobiliaria<b>{agencyName}{agencyCity ? ` · ${agencyCity}` : ""}</b></div>
        <div className="spacer" />
        <div className="usermenu">
          <div className="who"><b>{userName}</b></div>
          <div className="avatar">{initials(pu?.nombre || user.email)}</div>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost btn-sm" type="submit">Salir</button>
          </form>
        </div>
      </div>
      <main className="main">{children}</main>
    </div>
  );
}
