import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

function initials(name) {
  if (!name) return "BP";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function Agencia() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pu } = await supabase
    .from("partner_users")
    .select("partner_id, partners(nombre, ciudad, pais, estado, fecha_alta)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const { data: users } = await supabase
    .from("partner_users")
    .select("nombre, email, rol")
    .order("rol", { ascending: true });

  const ag = pu?.partners;

  return (
    <>
      <div className="page-head">
        <div><h1>Mi agencia</h1><p>Datos de tu inmobiliaria y usuarios con acceso.</p></div>
      </div>
      <div className="panel-c" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div className="avatar" style={{ width: 64, height: 64, borderRadius: 16, fontSize: 24, background: "linear-gradient(135deg,var(--navy),var(--teal))" }}>
            {initials(ag?.nombre)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 19, marginBottom: 10 }}>{ag?.nombre || "—"}</h3>
            <div className="kv">
              <div><div className="kk">Ubicación</div><div className="vv">{[ag?.pais, ag?.ciudad].filter(Boolean).join(" · ") || "—"}</div></div>
              <div><div className="kk">Estado</div><div className="vv" style={{ color: ag?.estado === "activa" ? "var(--ok)" : "var(--muted)" }}>{ag?.estado || "—"}</div></div>
              <div><div className="kk">Partner desde</div><div className="vv">{ag?.fecha_alta ? new Date(ag.fecha_alta).toLocaleDateString("es-ES", { month: "short", year: "numeric" }) : "—"}</div></div>
            </div>
          </div>
        </div>
      </div>
      <div className="panel-c">
        <div className="panel-head"><h3>Usuarios con acceso</h3></div>
        <div className="list">
          {(users || []).map((u, i) => (
            <div className="row-item" key={i}>
              <div className="avatar">{initials(u.nombre)}</div>
              <div className="ri-main"><b>{u.nombre}</b><span>{u.email} · {u.rol === "owner" ? "Responsable" : "Agente"}</span></div>
              <span className={`pill ${u.rol === "owner" ? "p-reserva" : "p-nuevo"}`}>{u.rol === "owner" ? "Owner" : "Agente"}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
