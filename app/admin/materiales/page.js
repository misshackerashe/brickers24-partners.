import { createClient } from "../../../utils/supabase/server";
import { listProjectPhotos } from "../../panel/materiales/actions";
import AdminMaterials from "./admin-materials";

export const dynamic = "force-dynamic";

export default async function AdminMaterialesPage() {
  const supabase = createClient();
  const { data: props } = await supabase
    .from("properties")
    .select("id, proyecto, slug")
    .eq("publicado", true)
    .order("proyecto", { ascending: true });

  const { data: mats } = await supabase
    .from("materials")
    .select("id, property_id, titulo, tipo, nivel, estado, origen_pendiente, storage_path, version, orden")
    .order("orden", { ascending: true });

  const projects = [];
  for (const p of props || []) {
    const fotos = await listProjectPhotos(p.slug);
    projects.push({
      ...p,
      materiales: (mats || []).filter((m) => m.property_id === p.id),
      fotos,
    });
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Materiales por proyecto</h1><p>Sube la documentación y las fotos de cada proyecto. Solo admin.</p></div>
      </div>
      <AdminMaterials projects={projects} />
    </>
  );
}
