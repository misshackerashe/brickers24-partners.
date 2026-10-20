import { createClient } from "../../utils/supabase/server";
import ApproveButton from "./approve-button";

export const dynamic = "force-dynamic";

const EST = {
  nueva: ["Nueva", "p-nuevo"],
  aprobada: ["Aprobada", "p-reserva"],
  rechazada: ["Rechazada", "p-perdido"],
};

export default async function AdminInbox() {
  const supabase = createClient();
  const { data: apps } = await supabase
    .from("partner_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Solicitudes de registro</h1>
          <p>Aprueba una solicitud para crear la agencia y enviarle el acceso por correo.</p>
        </div>
      </div>
      <div className="panel-c">
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Agencia</th><th>Responsable</th><th>Contacto</th><th>Estado</th><th>Recibida</th><th></th></tr>
            </thead>
            <tbody>
              {(apps || []).map((a) => {
                const e = EST[a.estado] || EST.nueva;
                return (
                  <tr key={a.id}>
                    <td><span className="name">{a.agencia}</span><div className="sub">{a.ubicacion || ""}</div></td>
                    <td>{a.nombre_responsable || "—"}<div className="sub">{a.cargo || ""}</div></td>
                    <td>{a.email}<div className="sub">{a.telefono || ""}</div></td>
                    <td><span className={`pill ${e[1]}`}>{e[0]}</span></td>
                    <td>{new Date(a.created_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td style={{ textAlign: "right" }}>
                      {a.estado === "nueva" ? <ApproveButton id={a.id} /> : <span className="stamp">Procesada</span>}
                    </td>
                  </tr>
                );
              })}
              {(!apps || apps.length === 0) && (
                <tr><td colSpan={6} className="empty">No hay solicitudes todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
