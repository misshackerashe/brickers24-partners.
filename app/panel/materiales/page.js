import { createClient } from "../../../utils/supabase/server";
import DownloadButton from "./download-button";

export const dynamic = "force-dynamic";

const TIPO = { pdf: "PDF", zip: "ZIP", mp4: "MP4" };
const NIVEL = { share: "Para compartir", internal: "Interno" };

export default async function Materiales({ searchParams }) {
  const supabase = createClient();
  const { data: props } = await supabase
    .from("properties")
    .select("proyecto, slug")
    .eq("publicado", true)
    .order("proyecto", { ascending: true });

  const fProy = searchParams?.proyecto || "";
  const fNivel = searchParams?.nivel || "";

  const { data: mats } = await supabase
    .from("materials")
    .select("id, titulo, tipo, nivel, version, estado, origen_pendiente, properties(proyecto, slug)")
    .order("orden", { ascending: true });

  const rows = (mats || []).filter(
    (m) => (!fProy || m.properties?.slug === fProy) && (!fNivel || m.nivel === fNivel)
  );

  return (
    <>
      <div className="page-head">
        <div><h1>Materiales</h1><p>Documentos por proyecto. "Para compartir" puedes enviarlo a tu cliente; "Interno" es solo para tu agencia.</p></div>
      </div>

      <div className="panel-c" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <form className="toolbar" method="get">
            <select name="proyecto" defaultValue={fProy}>
              <option value="">Todos los proyectos</option>
              {(props || []).map((p) => (
                <option key={p.slug} value={p.slug}>{p.proyecto}</option>
              ))}
            </select>
            <select name="nivel" defaultValue={fNivel}>
              <option value="">Todos los niveles</option>
              <option value="share">Para compartir</option>
              <option value="internal">Interno</option>
            </select>
            <button className="btn btn-ghost btn-sm" type="submit">Filtrar</button>
          </form>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{rows.length} material{rows.length === 1 ? "" : "es"}</span>
        </div>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Proyecto</th><th>Material</th><th></th></tr></thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.properties?.proyecto}</td>
                  <td>
                    <span className="name">{m.titulo}</span>
                    <div className="matmeta">
                      <span className={`lvl ${m.nivel}`}>{NIVEL[m.nivel]}</span>
                      {m.tipo ? <span style={{ fontSize: 12, color: "var(--muted)" }}>{TIPO[m.tipo]}</span> : null}
                      {m.version ? <span style={{ fontSize: 12, color: "var(--muted)" }}>v {new Date(m.version).toLocaleDateString("es-ES", { dateStyle: "medium" })}</span> : null}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <DownloadButton materialId={m.id} estado={m.estado} origen={m.origen_pendiente} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={3} className="empty">No hay materiales para ese filtro.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
