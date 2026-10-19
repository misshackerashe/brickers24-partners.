import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function Materiales() {
  const supabase = createClient();
  const { data: props } = await supabase
    .from("properties")
    .select("id, proyecto")
    .eq("publicado", true)
    .order("proyecto", { ascending: true });

  return (
    <>
      <div className="page-head">
        <div><h1>Materiales</h1><p>Fichas, fotografías y planos listos para enviar a tus clientes.</p></div>
      </div>
      <div className="list panel-c">
        {(props || []).map((p) => (
          <div className="row-item" key={p.id}>
            <div className="ri-main">
              <b>{p.proyecto}</b>
              <span>Ficha comercial · Galería de fotos · Planos</span>
            </div>
            <span className="pill p-perdido">Próximamente</span>
          </div>
        ))}
        {(!props || props.length === 0) && (
          <div className="row-item"><div className="ri-main"><b>Sin materiales</b><span>Se publicarán al conectar el catálogo de WordPress.</span></div></div>
        )}
      </div>
    </>
  );
}
