import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function Comisiones() {
  const supabase = createClient();
  const { data } = await supabase
    .from("property_commissions")
    .select("id, porcentaje, condiciones, vigente_hasta, properties(proyecto)")
    .order("porcentaje", { ascending: false });

  return (
    <>
      <div className="page-head">
        <div><h1>Comisiones y condiciones</h1><p>Aprobadas para tu agencia. El anexo firmado manda sobre cualquier resumen.</p></div>
      </div>
      <div className="panel-c">
        <div className="list">
          {(data || []).map((c) => (
            <div className="row-item" key={c.id}>
              <div className="ri-main">
                <b>{c.properties?.proyecto || "General"}</b>
                <span>{c.condiciones || "Condiciones según anexo."}</span>
              </div>
              <div className="pct">{c.porcentaje != null ? `${c.porcentaje}%` : "—"}</div>
            </div>
          ))}
          {(!data || data.length === 0) && (
            <div className="row-item"><div className="ri-main"><b>Sin comisiones publicadas todavía</b><span>Brickers24 cargará aquí las condiciones por proyecto aprobadas para tu agencia.</span></div></div>
          )}
        </div>
      </div>
    </>
  );
}
