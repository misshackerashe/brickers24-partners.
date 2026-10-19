import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

const GRADS = [
  "linear-gradient(135deg,#0a9ca6,#1b2a5b)",
  "linear-gradient(135deg,#1b2a5b,#0a9ca6)",
  "linear-gradient(135deg,#b8912f,#1b2a5b)",
  "linear-gradient(135deg,#1b2a5b,#b8912f)",
];
const DISP = {
  disponible: ["Disponible", "p-reserva"],
  limitada: ["Disponibilidad limitada", "p-visita"],
  agotada: ["Agotado", "p-nuevo"],
  no_publicada: ["No publicada", "p-perdido"],
};

function money(n, m) {
  if (n == null) return "Consultar";
  return `Desde ${Number(n).toLocaleString("es-ES")} ${m || "US$"}`;
}

export default async function Catalogo() {
  const supabase = createClient();
  const { data: props } = await supabase
    .from("properties")
    .select("*")
    .eq("publicado", true)
    .order("destacado", { ascending: false })
    .order("proyecto", { ascending: true });

  return (
    <>
      <div className="page-head">
        <div><h1>Catálogo de proyectos</h1><p>Proyectos verificados y autorizados para tu inmobiliaria.</p></div>
      </div>
      <div className="grid-cards">
        {(props || []).map((p, i) => {
          const d = DISP[p.disponibilidad] || DISP.disponible;
          return (
            <article className="pcard" key={p.id}>
              <div className="top" style={{ background: GRADS[i % GRADS.length] }}>
                <span className={`av pill ${d[1]}`}>{d[0]}</span>
                {p.ubicacion ? <span className="loc">{p.ubicacion}</span> : null}
              </div>
              <div className="bd">
                <h3>{p.proyecto}</h3>
                <div className="meta">{p.tipologias || ""}</div>
                <div className="price">{money(p.precio_desde, p.moneda)}</div>
                {p.fecha_verificacion ? (
                  <div className="verif">✓ Verificado {new Date(p.fecha_verificacion).toLocaleDateString("es-ES", { dateStyle: "medium" })}</div>
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
