import { createClient } from "../../../utils/supabase/server";
import { listTypeMedia } from "../../panel/materiales/actions";
import AdminProyectos from "./admin-proyectos";

export const dynamic = "force-dynamic";

export default async function AdminProyectosPage() {
  const supabase = createClient();
  const { data: props } = await supabase
    .from("properties")
    .select("id, proyecto, slug, secciones")
    .order("proyecto", { ascending: true });

  const { data: tipos } = await supabase
    .from("unit_types")
    .select("id, property_id, codigo, nombre, metraje, habitaciones, banos, parqueo, descripcion, orden, activo")
    .order("orden", { ascending: true });

  const projects = [];
  for (const p of props || []) {
    const misTipos = (tipos || []).filter((t) => t.property_id === p.id);
    const tiposConMedia = [];
    for (const t of misTipos) {
      const media = await listTypeMedia(p.slug, t.codigo);
      tiposConMedia.push({ ...t, fotos: media.fotos, plano: media.plano });
    }
    projects.push({
      ...p,
      secciones: p.secciones || {},
      tipos: tiposConMedia,
    });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Proyectos</h1>
          <p>Activa o desactiva secciones y gestiona los tipos de apartamento (ficha técnica, fotos y plano). Solo admin.</p>
        </div>
      </div>
      <AdminProyectos projects={projects} />
    </>
  );
}
