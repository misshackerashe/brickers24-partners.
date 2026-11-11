import { createClient } from "../../../utils/supabase/server";
import { getProyecto } from "../../../data/proyectos";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GRADS = [
  "linear-gradient(135deg,#0AA0A4,#24346B)",
  "linear-gradient(135deg,#24346B,#0AA0A4)",
];

export default async function Catalogo() {
  const supabase = createClient();
  const { data: props } = await supabase
    .from("properties")
    .select("id, proyecto, slug, ubicacion, estado_verificacion")
    .eq("publicado", true)
    .order("proyecto", { ascending: true });

  return (
    <>
      <div className="page-head">
        <div><h1>Catálogo de proyectos</h1><p>Proyectos autorizados para tu inmobiliaria.</p></div>
      </div>
      <div className="grid-cards">
        {(props || []).map((p, i) => {
          const portada = getProyecto(p.slug)?.portada;
          return (
          <article className="pcard" key={p.id}>
            <div
              className="top"
              style={
                portada
                  ? { backgroundImage: `url(${portada})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: GRADS[i % GRADS.length] }
              }
            >
              {p.ubicacion ? <span className="loc">{p.ubicacion}</span> : null}
            </div>
            <div className="bd">
              <h3>{p.proyecto}</h3>
              <div className="meta">Unidades listas · entrega inmediata</div>
              <div style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 600 }}>Precio según inventario</div>
              <div style={{ fontSize: 12.5, color: "var(--gold)", fontWeight: 600 }}>{p.estado_verificacion || "Verificación en curso"}</div>
              {p.slug ? (
                <div style={{ marginTop: 12 }}>
                  <Link className="btn btn-gold btn-sm" href={`/proyectos/${p.slug}`}>Ver ficha</Link>
                </div>
              ) : null}
            </div>
          </article>
          );
        })}
        {(!props || props.length === 0) && <p className="empty">El catálogo aún no tiene proyectos publicados.</p>}
      </div>
    </>
  );
}
