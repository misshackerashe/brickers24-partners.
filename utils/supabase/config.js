// Valores públicos del proyecto Supabase (la llave "publishable/anon" está
// pensada para usarse en el cliente; la seguridad real la aplican las
// políticas RLS de la base de datos). Se pueden sobreescribir por entorno.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://unfgsuzjldcvsbbllpqw.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_jKi3zb8otU0VNqJp7ZZnsw_MPUpnukC";
