"use server";

import { createClient } from "../../../utils/supabase/server";
import { revalidatePath } from "next/cache";

async function isAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("admin_users")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return !!data;
}

const SECCIONES_VALIDAS = ["tipologias", "planos", "ficha", "documentos", "galeria"];

// Activa/desactiva una sección del proyecto (merge sobre el JSON existente).
export async function setSeccion(propertyId, clave, valor) {
  const supabase = createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado." };
  if (!SECCIONES_VALIDAS.includes(clave)) return { error: "Sección inválida." };

  const { data: prop } = await supabase
    .from("properties")
    .select("secciones")
    .eq("id", propertyId)
    .maybeSingle();
  const secciones = { ...(prop?.secciones || {}), [clave]: !!valor };

  const { error } = await supabase.from("properties").update({ secciones }).eq("id", propertyId);
  if (error) return { error: error.message };

  revalidatePath("/admin/proyectos");
  revalidatePath("/panel/catalogo");
  return { ok: true };
}

// Crea o actualiza la ficha técnica de un tipo (A/B/C/…).
export async function upsertUnitType(payload) {
  const supabase = createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado." };

  const row = {
    property_id: payload.property_id,
    codigo: (payload.codigo || "").trim(),
    nombre: (payload.nombre || "").trim() || `Tipo ${(payload.codigo || "").trim()}`,
    metraje: payload.metraje?.trim() || null,
    habitaciones: payload.habitaciones?.trim() || null,
    banos: payload.banos?.trim() || null,
    parqueo: payload.parqueo?.trim() || null,
    descripcion: payload.descripcion?.trim() || null,
    orden: Number.isFinite(payload.orden) ? payload.orden : 0,
    activo: payload.activo !== false,
    updated_at: new Date().toISOString(),
  };
  if (!row.codigo) return { error: "El código del tipo es obligatorio." };

  const { error } = await supabase
    .from("unit_types")
    .upsert(row, { onConflict: "property_id,codigo" });
  if (error) return { error: error.message };

  revalidatePath("/admin/proyectos");
  revalidatePath("/panel/catalogo");
  return { ok: true };
}

export async function deleteUnitType(id) {
  const supabase = createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado." };
  const { error } = await supabase.from("unit_types").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/proyectos");
  return { ok: true };
}
