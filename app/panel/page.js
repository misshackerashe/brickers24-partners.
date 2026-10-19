import { createClient } from "../../utils/supabase/server";

export const dynamic = "force-dynamic";

const ESTADO = {
  nuevo: ["Nuevo", "p-nuevo"],
  contactado: ["Contactado", "p-contactado"],
  visita: ["Visita agendada", "p-visita"],
  reserva: ["Reserva", "p-reserva"],
  cerrado: ["Cerrado", "p-cerrado"],
  perdido: ["Perdido", "p-perdido"],
};

export default async function Resumen() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pu } = await supabase
    .from("partner_users")
    .select("nombre")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  const first = (pu?.nombre || "").split(" ")[0] || "";

  const c = async (q) => (await q).count || 0;
  const total = await c(supabase.from("buyer_leads").select("*", { count: "exact", head: true }));
  const reserva = await c(supabase.from("buyer_leads").select("*", { count: "exact", head: true }).eq("estado", "reserva"));
  const visita = await c(supabase.from("buyer_leads").select("*", { count: "exact", head: true }).eq("estado", "visita"));
  const props = await c(supabase.from("properties").select("*", { count: "exact", head: true }).eq("publicado", true));

  const { data: recientes } = await supabase
    .from("buyer_leads")
    .select("nombre, proyecto_interes, estado, fecha_registro, properties(proyecto)")
    .order("fecha_registro", { ascending: false })
    .limit(6);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Bienvenida{first ? `, ${first}` : ""}</h1>
          <p>Resumen de la actividad de tu inmobiliaria.</p>
        </div>
      </div>
      <div className="tiles">
        <div className="tile"><div className="k">A tu nombre</div><div className="v teal">{total}</div><div className="d">Compradores registrados</div></div>
        <div className="tile"><div className="k">En reserva</div><div className="v ok">{reserva}</div><div className="d">Operaciones en curso</div></div>
        <div className="tile"><div className="k">Visitas</div><div className="v gold">{visita}</div><div className="d">Agendadas</div></div>
        <div className="tile"><div className="k">Catálogo</div><div className="v">{props}</div><div className="d">Proyectos disponibles</div></div>
      </div>
      <div className="panel-c">
        <div className="panel-head"><h3>Actividad reciente</h3></div>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Comprador</th><th>Proyecto</th><th>Estado</th><th>Registrado</th></tr></thead>
            <tbody>
              {(recientes || []).map((l, i) => {
                const e = ESTADO[l.estado] || ESTADO.nuevo;
                const proyecto = l.properties?.proyecto || l.proyecto_interes || "—";
                return (
                  <tr key={i}>
                    <td><span className="name">{l.nombre}</span></td>
                    <td>{proyecto}</td>
                    <td><span className={`pill ${e[1]}`}>{e[0]}</span></td>
                    <td>{new Date(l.fecha_registro).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</td>
                  </tr>
                );
              })}
              {(!recientes || recientes.length === 0) && (
                <tr><td colSpan={4} className="empty">Aún no hay compradores registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
