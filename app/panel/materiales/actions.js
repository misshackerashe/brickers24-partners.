"use server";

import { createClient } from "../../../utils/supabase/server";

// Genera una URL firmada de corta duración para un material disponible,
// solo para partners aprobados, y registra la descarga para los KPIs.
export async function getMaterialSignedUrl(materialId) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: pu } = await supabase
    .from("partner_users")
    .select("id, partner_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!pu) return { error: "No autorizado." };

  const { data: mat } = await supabase
    .from("materials")
    .select("id, storage_path, estado")
    .eq("id", materialId)
    .maybeSingle();
  if (!mat || mat.estado !== "disponible" || !mat.storage_path) {
    return { error: "Material no disponible." };
  }

  const { data: signed, error: sErr } = await supabase.storage
    .from("materiales")
    .createSignedUrl(mat.storage_path, 60);
  if (sErr || !signed?.signedUrl) {
    return { error: "No se pudo generar el enlace. El archivo aún no está cargado." };
  }

  await supabase.from("material_downloads").insert({
    material_id: mat.id,
    partner_id: pu.partner_id,
    partner_user_id: pu.id,
    email: user.email,
  });

  return { url: signed.signedUrl };
}

// Lista las fotos de un proyecto (bucket privado, URLs firmadas) para la galería.
// Accesible a admin y partners aprobados (RLS de storage).
export async function listProjectPhotos(slug) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: list } = await supabase.storage
    .from("materiales")
    .list(`${slug}/fotos`, { limit: 100, sortBy: { column: "name", order: "asc" } });

  const files = (list || []).filter((f) => f?.name && !f.name.startsWith("."));
  const out = [];
  for (const f of files) {
    const path = `${slug}/fotos/${f.name}`;
    const { data: s } = await supabase.storage.from("materiales").createSignedUrl(path, 300);
    if (s?.signedUrl) out.push({ name: f.name, path, url: s.signedUrl });
  }
  return out;
}
