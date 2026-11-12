import { getProyecto, CONTACTO } from "../../../data/proyectos";
import { createClient } from "../../../utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RegisterForm from "../../panel/compradores/register-form";
import DownloadButton from "../../panel/materiales/download-button";
import { listProjectPhotos, listTypeMedia } from "../../panel/materiales/actions";

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
    .select("id, proyecto, estado_verificacion, slug, secciones")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!prop) notFound();

  // Secciones visibles (por defecto todo visible si no está definido).
  const sec = prop.secciones || {};
  const on = (k) => sec[k] !== false;

  const { data: mats } = await supabase
    .from("materials")
    .select("id, titulo, tipo, nivel, version, estado, origen_pendiente")
    .eq("property_id", prop.id)
    .order("orden", { ascending: true });

  // Tipos de apartamento (ficha técnica) + sus medios (fotos/plano).
  const { data: tiposRows } = await supabase
    .from("unit_types")
    .select("id, codigo, nombre, metraje, habitaciones, banos, parqueo, descripcion, orden")
    .eq("property_id", prop.id)
    .eq("activo", true)
    .order("orden", { ascending: true });

  const tipos = [];
  for (const t of tiposRows || []) {
    const media = await listTypeMedia(prop.slug, t.codigo);
    tipos.push({ ...t, fotos: media.fotos, plano: media.plano });
  }

  const fotos = await listProjectPhotos(prop.slug);

  // Materiales: la ficha comercial depende del toggle "ficha"; el resto, de "documentos".
  const materiales = (mats || []).filter((m) => {
    if (m.titulo === "Fotografías") return false;
    const esFicha = /ficha/i.test(m.titulo || "");
    return esFicha ? on("ficha") : on("documentos");
  });

  return (
    <div className="ficha">
      <Link href="/panel/catalogo" className="crumb">← Volver al catálogo</Link>

      {/* Portada */}
      {proy.portada ? (
        <div style={{ borderRadius: 16, overflow: "hidden", margin: "14px 0 6px", aspectRatio: "16 / 7", background: "#0b1a3a" }}>
          <img src={proy.portada} alt={proy.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      ) : null}

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

      {/* Tipos de apartamento */}
      {on("tipologias") ? (
        <div className="sec">
          <h2>Tipos de apartamento</h2>
          {tipos.length > 0 ? (
            <div style={{ display: "grid", gap: 14 }}>
              {tipos.map((t) => (
                <div className="panel-c" key={t.id} style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <b style={{ fontSize: 16 }}>{t.nombre || `Tipo ${t.codigo}`}</b>
                    {t.metraje ? <span className="chip teal">{t.metraje}</span> : null}
                  </div>

                  {(t.habitaciones || t.banos || t.parqueo) ? (
                    <div className="dist" style={{ marginTop: 10 }}>
                      {t.habitaciones ? <div className="r"><b>Habitaciones</b><span>{t.habitaciones}</span></div> : null}
                      {t.banos ? <div className="r"><b>Baños</b><span>{t.banos}</span></div> : null}
                      {t.parqueo ? <div className="r"><b>Parqueo</b><span>{t.parqueo}</span></div> : null}
                    </div>
                  ) : null}

                  {t.descripcion ? <p className="prose" style={{ marginTop: 10 }}>{t.descripcion}</p> : null}
                  {!t.metraje && !t.habitaciones && !t.descripcion ? (
                    <p className="nota" style={{ marginTop: 8 }}>Metrajes exactos con el inventario de CBS.</p>
                  ) : null}

                  {/* Plano del tipo */}
                  {on("planos") && t.plano?.length ? (
                    <div style={{ marginTop: 12 }}>
                      <div className="nota" style={{ marginBottom: 6 }}>Plano</div>
                      <div className="galeria">
                        {t.plano.map((p) => (
                          /\.pdf$/i.test(p.name) ? (
                            <a className="ph" key={p.path} href={p.url} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>Ver plano (PDF)</a>
                          ) : (
                            <a className="ph" key={p.path} href={p.url} target="_blank" rel="noopener" style={{ padding: 0 }}>
                              <img src={p.url} alt="Plano" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Fotos del tipo */}
                  {t.fotos?.length ? (
                    <div style={{ marginTop: 12 }}>
                      <div className="nota" style={{ marginBottom: 6 }}>Fotos</div>
                      <div className="galeria">
                        {t.fotos.map((f) => (
                          <div className="ph" key={f.path} style={{ padding: 0, position: "relative" }}>
                            <a href={f.url} target="_blank" rel="noopener">
                              <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                            </a>
                            <a className="dl-foto" href={`${f.url}&download=${encodeURIComponent(f.name)}`} title="Descargar foto">⤓ Descargar</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="prose">{proy.tipologiasTexto || "Tipologías en preparación."}</p>
          )}
          {proy.tipologiasNota ? <p className="nota">{proy.tipologiasNota}</p> : null}
        </div>
      ) : null}

      {/* Galería */}
      {on("galeria") ? (
        <div className="sec">
          <h2>Galería</h2>
          <div className="galeria">
            {fotos.length > 0
              ? fotos.map((f) => (
                  <div className="ph" key={f.path} style={{ padding: 0, position: "relative" }}>
                    <a href={f.url} target="_blank" rel="noopener">
                      <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                    </a>
                    <a className="dl-foto" href={`${f.url}&download=${encodeURIComponent(f.name)}`} title="Descargar foto">⤓ Descargar</a>
                  </div>
                ))
              : [0, 1, 2, 3, 4, 5].map((i) => <div className="ph" key={i}>Fotos reales pendientes</div>)}
          </div>
        </div>
      ) : null}

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
      {(on("ficha") || on("documentos")) ? (
        <div className="sec">
          <h2>Materiales del proyecto</h2>
          <div className="panel-c list">
            {materiales.length > 0 ? materiales.map((m) => (
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
            )) : <div className="empty" style={{ padding: 16 }}>No hay materiales disponibles.</div>}
          </div>
        </div>
      ) : null}

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
