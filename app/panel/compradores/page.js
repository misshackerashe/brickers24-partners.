import { createClient } from "../../../utils/supabase/server";
import RegisterForm from "./register-form";

export const dynamic = "force-dynamic";

const ESTADO = {
  nuevo: ["Nuevo", "p-nuevo"],
  contactado: ["Contactado", "p-contactado"],
  visita: ["Visita agendada", "p-visita"],
  reserva: ["Reserva", "p-reserva"],
  cerrado: ["Cerrado", "p-cerrado"],
  perdido: ["Perdido", "p-perdido"],
};

export default async function Compradores() {
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("buyer_leads")
    .select("id, nombre, estado, fecha_registro, proyecto_interes, properties(proyecto)")
    .order("fecha_registro", { ascending: false });
  const { data: props } = await supabase
    .from("properties")
    .select("id, proyecto")
    .eq("publicado", true)
    .order("proyecto", { ascending: true });

  return (
    <>
      <div className="page-head">
        <div><h1>Mis compradores</h1><p>Cada comprador queda a tu nombre con fecha y hora.</p></div>
        <RegisterForm properties={props || []} />
      </div>
      <div className="panel-c">
        <div className="tablewrap">
          <table>
            <thead><tr><th>Comprador</th><th>Proyecto</th><th>Estado</th><th>Registrado</th><th>Protección</th></tr></thead>
            <tbody>
              {(leads || []).map((l) => {
                const e = ESTADO[l.estado] || ESTADO.nuevo;
                const proyecto = l.properties?.proyecto || l.proyecto_interes || "—";
                return (
                  <tr key={l.id}>
                    <td><span className="name">{l.nombre}</span></td>
                    <td>{proyecto}</td>
                    <td><span className={`pill ${e[1]}`}>{e[0]}</span></td>
                    <td>{new Date(l.fecha_registro).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td><span className="stamp">A tu nombre</span></td>
                  </tr>
                );
              })}
              {(!leads || leads.length === 0) && (
                <tr><td colSpan={5} className="empty">Aún no has registrado compradores. Usa “Registrar comprador”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
