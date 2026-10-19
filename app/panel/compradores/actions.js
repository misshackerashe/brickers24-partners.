"use server";

import { createClient } from "../../../utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerLead(prevState, formData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Vuelve a entrar." };

  const { data: pu } = await supabase
    .from("partner_users")
    .select("id, partner_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!pu) return { ok: false, error: "Tu usuario no está ligado a una agencia." };

  const nombre = (formData.get("nombre") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const telefono = (formData.get("telefono") || "").toString().trim();
  const property_id = (formData.get("property_id") || "").toString() || null;
  const notas = (formData.get("notas") || "").toString().trim() || null;

  if (!nombre || !property_id) return { ok: false, error: "Completa el nombre y el proyecto." };

  const norm = (email ? email.toLowerCase() : telefono.replace(/\D/g, "")) || null;

  const { error } = await supabase.from("buyer_leads").insert({
    partner_id: pu.partner_id,
    registrado_por: pu.id,
    nombre,
    email: email || null,
    telefono: telefono || null,
    contacto_norm: norm,
    property_id,
    estado: "nuevo",
    notas,
  });

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Ese comprador ya está registrado (posible duplicado)." };
    return { ok: false, error: "No se pudo registrar. Inténtalo de nuevo." };
  }

  revalidatePath("/panel/compradores");
  revalidatePath("/panel");
  return { ok: true, error: "" };
}
