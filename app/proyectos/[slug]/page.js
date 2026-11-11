import { getProyecto, CONTACTO } from "../../../data/proyectos";
import { createClient } from "../../../utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RegisterForm from "../../panel/compradores/register-form";
import DownloadButton from "../../panel/materiales/download-button";
import { listProjectPhotos } from "../../panel/materiales/actions";

export const dynamic = "force-dynamic";

const NIVEL = { share: "Para compartir", internal: "Interno" };
const TIPO = { pdf: "PDF", zip: "ZIP", mp4: "MP4" };

export default async function Ficha({ params }) {
  const proy = getProyecto(params.slug);
  if (!proy) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prop } = await supabase
    .from("properties")
    .select("id, proyecto, estado_verificacion, slug")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!prop) notFound();

  const { data: mats } = await supabase
    .from("materials")
    .select("id, titulo, tipo, nivel, version, estado, origen_pendiente")
    .eq("property_id", prop.id)
    .order("orden", { ascending: true });

  const fotos = await listProjectPhotos(prop.slug);

  return (
    <div className="ficha">
      <Link href="/panel/catalogo" className="crumb">← Volver al catálogo</Link>

      {/* Encabezado */}
      <div className="ficha-head">
        <div style={{ minWidth: 0 }}>
          <h1>{proy.nombre}</h1>
          <div className="loc">{proy.ubicacion}</div>
          <div className="builder">{proy.constructora}</div>
          <div className="ficha-chips">
            <span className="chip teal">{proy.chip}</span>
            <span className="chip warn">{prop.estado_verificacion || "Verificación en curso"}</span>
          </div>
        </div>
        <div className="ficha-actions">
          <RegisterForm properties={[{ id: prop.id, proyecto: prop.proyecto }]} preselectId={prop.id} label="Registrar comprador" />
        </div>
      </div>

      {/* Cifras clave */}
      <div className="sec">
        <div className="cifras">
          {proy.cifras.map((c, i) => (
            <div className="cifra" key={i}><div className="k">{c.k}</div><div className="v">{c.v}</div></div>
          ))}
        </div>
      </div>

      {/* El proyecto */}
      <div className="sec">
        <h2>El proyecto</h2>
        <p className="prose">{proy.descripcion}</p>
      </div>

      {/* Tipologías */}
      <div className="sec">
        <h2>Tipologías</h2>
        {proy.tipologias && proy.tipologias.length > 0 ? (
          <div className="panel-c tablewrap">
            <table>
              <thead><tr><th>Tipo</th><th>Metraje</th><th>Habitaciones</th><th>Baños</th><th>Parqueo</th></tr></thead>
              <tbody>
                {proy.tipologias.map((t, i) => (
                  <tr key={i}><td><span className="name">{t.tipo}</span></td><td>{t.m2}</td><td>{t.hab}</td><td>{t.banos}</td><td>{t.parqueo}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="prose">{proy.tipologiasTexto}</p>
        )}
        {proy.tipologiasNota ? <p className="nota">{proy.tipologiasNota}</p> : null}
      </div>

      {/* Galería */}
      <div className="sec">
        <h2>Galería</h2>
        <div className="galeria">
          {fotos.length > 0
            ? fotos.map((f) => (
                <div className="ph" key={f.path} style={{ padding: 0 }}>
                  <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                </div>
              ))
            : [0, 1, 2, 3, 4, 5].map((i) => <div className="ph" key={i}>Fotos reales pendientes</div>)}
        </div>
        <p className="nota">Solo fotos y video reales de lo construido. No se usan renders.</p>
      </div>

      {/* Amenidades */}
      <div className="sec">
        <h2>Amenidades</h2>
        <div className="chips">
          {proy.amenidades.map((a, i) => <span className="chip" key={i}>{a}</span>)}
        </div>
        {proy.amenidadesNota ? <p className="nota">{proy.amenidadesNota}</p> : null}
      </div>

      {/* Ubicación + distancias */}
      <div className="sec">
        <h2>Ubicación</h2>
        <p className="prose">{proy.ubicacion}</p>
        <div className="dist" style={{ marginTop: 10 }}>
          {proy.distancias.map((d, i) => (
            <div className="r" key={i}><b>{d.a}</b><span>{d.d}</span></div>
          ))}
        </div>
      </div>

      {/* Inventario y precios (uso interno) */}
      <div className="sec">
        <h2>Inventario y precios</h2>
        <div className="aviso">
          <span className="i">i</span>
          <p>
            Uso interno de la agencia. <b>Precio según inventario.</b> Pide el inventario actualizado y los precios a{" "}
            <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a> o por WhatsApp{" "}
            <a href={CONTACTO.whatsappLink} target="_blank" rel="noopener">{CONTACTO.whatsapp}</a> <b>antes de ofertar</b>.
          </p>
        </div>
      </div>

      {/* Materiales del proyecto */}
      <div className="sec">
        <h2>Materiales del proyecto</h2>
        <div className="panel-c list">
          {(mats || []).filter((m) => m.titulo !== "Fotografías").map((m) => (
            <div className="row-item" key={m.id}>
              <div className="ri-main">
                <b>{m.titulo}</b>
                <div className="matmeta">
                  <span className={`lvl ${m.nivel}`}>{NIVEL[m.nivel]}</span>
                  {m.tipo ? <span style={{ fontSize: 12, color: "var(--muted)" }}>{TIPO[m.tipo]}</span> : null}
                  {m.version ? <span style={{ fontSize: 12, color: "var(--muted)" }}>v {new Date(m.version).toLocaleDateString("es-ES", { dateStyle: "medium" })}</span> : null}
                </div>
              </div>
              <DownloadButton materialId={m.id} estado={m.estado} origen={m.origen_pendiente} />
            </div>
          ))}
        </div>
      </div>

      {/* Antes de vender */}
      <div className="sec">
        <h2>Antes de vender</h2>
        <ul className="antes">
          <li>Registra al comprador <b>antes</b> de enviarle información.</li>
          <li>Comparte solo materiales marcados <b>"Para compartir"</b>.</li>
          <li>No prometas rentabilidad ni ingresos por alquiler.</li>
          <li>Confirma la disponibilidad con Brickers24 <b>antes de reservar</b>.</li>
        </ul>
      </div>
    </div>
  );
}
