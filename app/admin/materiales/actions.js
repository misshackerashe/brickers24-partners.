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

// Marca un material como disponible con su ruta de archivo (tras subirlo a Storage).
export async function markMaterialAvailable(materialId, storagePath, tipo) {
  const supabase = createClient();
  if (!(await isAdmin(supabase))) return { error: "No autorizado." };

  const upd = {
    storage_path: storagePath,
    estado: "disponible",
    version: new Date().toISOString().slice(0, 10),
  };
  if (tipo) upd.tipo = tipo;

  const { error } = await supabase.from("materials").update(upd).eq("id", materialId);
  if (error) return { error: error.message };

  revalidatePath("/admin/materiales");
  revalidatePath("/panel/materiales");
  return { ok: true };
}
