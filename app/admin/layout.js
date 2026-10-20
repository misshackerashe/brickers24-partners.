import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("auth_user_id, nombre")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!adminRow) redirect("/panel");

  return (
    <div className="app">
      <div className="topbar">
        <span className="logo">brickers<span className="t">24</span><small>Admin</small></span>
        <div className="agency">Administración<b>{adminRow.nombre || "Brickers24"}</b></div>
        <div className="spacer" />
        <div className="usermenu">
          <div className="avatar">BK</div>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost btn-sm" type="submit">Salir</button>
          </form>
        </div>
      </div>
      <div className="shell">
        <aside className="sidebar">
          <nav className="nav"><a className="active" href="/admin">Solicitudes</a></nav>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
