"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { setSeccion, upsertUnitType, deleteUnitType } from "./actions";

const SECCIONES = [
  { key: "tipologias", label: "Tipos de apartamento" },
  { key: "planos", label: "Planos" },
  { key: "ficha", label: "Ficha comercial" },
  { key: "documentos", label: "Documentos" },
  { key: "galeria", label: "Galería de fotos" },
];

function sanitize(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function AdminProyectos({ projects }) {
  const router = useRouter();
  const [msg, setMsg] = useState(null);

  return (
    <>
      {msg ? (
        <div className={msg.type === "ok" ? "ok show" : "auth-err"} style={{ marginBottom: 16 }}>{msg.text}</div>
      ) : null}

      {projects.map((proj) => (
        <ProjectBlock key={proj.id} proj={proj} setMsg={setMsg} router={router} />
      ))}
    </>
  );
}

function ProjectBlock({ proj, setMsg, router }) {
  const [sec, setSec] = useState(proj.secciones || {});
  const [busy, setBusy] = useState("");

  async function toggle(key) {
    const valor = !sec[key];
    setSec((s) => ({ ...s, [key]: valor }));
    setBusy("sec:" + key);
    const res = await setSeccion(proj.id, key, valor);
    setBusy("");
    if (res?.error) {
      setSec((s) => ({ ...s, [key]: !valor }));
      setMsg({ type: "err", text: res.error });
    } else {
      setMsg({ type: "ok", text: `"${proj.proyecto}": sección actualizada.` });
    }
  }

  async function addTipo() {
    const codigo = (prompt("Código del nuevo tipo (ej. D):") || "").trim().toUpperCase();
    if (!codigo) return;
    setBusy("addtipo");
    const res = await upsertUnitType({
      property_id: proj.id,
      codigo,
      nombre: `Tipo ${codigo}`,
      orden: (proj.tipos?.length || 0) + 1,
    });
    setBusy("");
    if (res?.error) setMsg({ type: "err", text: res.error });
    else {
      setMsg({ type: "ok", text: `Tipo ${codigo} creado.` });
      router.refresh();
    }
  }

  return (
    <div className="panel-c" style={{ marginBottom: 22 }}>
      <div className="panel-head"><h3>{proj.proyecto}</h3></div>

      {/* Toggles de secciones */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
        <b style={{ fontSize: 13.5 }}>Vistas visibles en la ficha</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {SECCIONES.map((s) => {
            const on = sec[s.key] !== false;
            return (
              <button
                key={s.key}
                onClick={() => toggle(s.key)}
                disabled={busy === "sec:" + s.key}
                className="btn btn-sm"
                style={{
                  borderRadius: 999,
                  border: "1px solid var(--line)",
                  background: on ? "var(--teal)" : "transparent",
                  color: on ? "#fff" : "var(--muted)",
                  fontWeight: 600,
                }}
                title={on ? "Visible — clic para ocultar" : "Oculta — clic para mostrar"}
              >
                {on ? "● " : "○ "}{s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipos de apartamento */}
      <div style={{ padding: "14px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <b style={{ fontSize: 13.5 }}>Tipos de apartamento ({proj.tipos.length})</b>
          <button className="btn btn-ghost btn-sm" onClick={addTipo} disabled={busy === "addtipo"}>
            {busy === "addtipo" ? "Creando…" : "+ Añadir tipo"}
          </button>
        </div>

        {proj.tipos.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Aún no hay tipos. Añade Tipo A, B, C…</p>
        ) : (
          proj.tipos.map((t) => (
            <TypeCard key={t.id} proj={proj} tipo={t} setMsg={setMsg} router={router} />
          ))
        )}
      </div>
    </div>
  );
}

function TypeCard({ proj, tipo, setMsg, router }) {
  const supabase = createClient();
  const [f, setF] = useState({
    nombre: tipo.nombre || "",
    metraje: tipo.metraje || "",
    habitaciones: tipo.habitaciones || "",
    banos: tipo.banos || "",
    parqueo: tipo.parqueo || "",
    descripcion: tipo.descripcion || "",
    activo: tipo.activo !== false,
  });
  const [busy, setBusy] = useState("");
  const base = `${proj.slug}/tipos/${tipo.codigo}`;

  function upd(k, v) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function guardar() {
    setBusy("save");
    const res = await upsertUnitType({
      property_id: proj.id,
      codigo: tipo.codigo,
      orden: tipo.orden,
      ...f,
    });
    setBusy("");
    if (res?.error) setMsg({ type: "err", text: res.error });
    else {
      setMsg({ type: "ok", text: `Tipo ${tipo.codigo} guardado.` });
      router.refresh();
    }
  }

  async function borrarTipo() {
    if (!confirm(`¿Eliminar ${tipo.nombre}? (no borra las fotos ya subidas)`)) return;
    setBusy("deltipo");
    const res = await deleteUnitType(tipo.id);
    setBusy("");
    if (res?.error) setMsg({ type: "err", text: res.error });
    else {
      setMsg({ type: "ok", text: `Tipo ${tipo.codigo} eliminado.` });
      router.refresh();
    }
  }

  async function uploadFotos(files) {
    setBusy("fotos");
    let ok = 0;
    const errs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${base}/fotos/${Date.now()}-${i}-${rand}-${sanitize(file.name)}`;
      const { error } = await supabase.storage
        .from("materiales")
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (error) errs.push(error.message);
      else ok++;
    }
    setBusy("");
    if (ok > 0) setMsg({ type: "ok", text: `${ok} foto(s) subida(s) al Tipo ${tipo.codigo}.` });
    else if (errs.length) setMsg({ type: "err", text: `No se pudo subir: ${errs[0]}` });
    router.refresh();
  }

  async function uploadPlano(file) {
    setBusy("plano");
    try {
      // Un solo plano por tipo: borra los existentes primero.
      if (tipo.plano?.length) {
        await supabase.storage.from("materiales").remove(tipo.plano.map((p) => p.path));
      }
      const path = `${base}/plano/${sanitize(file.name)}`;
      const { error } = await supabase.storage
        .from("materiales")
        .upload(path, file, { upsert: true, contentType: file.type || undefined });
      if (error) throw error;
      setMsg({ type: "ok", text: `Plano del Tipo ${tipo.codigo} actualizado.` });
      router.refresh();
    } catch (e) {
      setMsg({ type: "err", text: `No se pudo subir el plano: ${e.message || e}` });
    }
    setBusy("");
  }

  async function borrar(path) {
    setBusy("del:" + path);
    const { error } = await supabase.storage.from("materiales").remove([path]);
    setBusy("");
    if (error) setMsg({ type: "err", text: `No se pudo borrar: ${error.message}` });
    else router.refresh();
  }

  const inp = { padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: 13.5, width: "100%" };

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <b style={{ fontSize: 14 }}>{tipo.codigo} · {f.nombre || `Tipo ${tipo.codigo}`}</b>
        <label style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={f.activo} onChange={(e) => upd("activo", e.target.checked)} /> Activo
        </label>
      </div>

      {/* Ficha técnica */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
        <label style={{ fontSize: 12, color: "var(--muted)" }}>Nombre
          <input style={inp} value={f.nombre} onChange={(e) => upd("nombre", e.target.value)} placeholder={`Tipo ${tipo.codigo}`} />
        </label>
        <label style={{ fontSize: 12, color: "var(--muted)" }}>Metraje
          <input style={inp} value={f.metraje} onChange={(e) => upd("metraje", e.target.value)} placeholder="82 m²" />
        </label>
        <label style={{ fontSize: 12, color: "var(--muted)" }}>Habitaciones
          <input style={inp} value={f.habitaciones} onChange={(e) => upd("habitaciones", e.target.value)} placeholder="3" />
        </label>
        <label style={{ fontSize: 12, color: "var(--muted)" }}>Baños
          <input style={inp} value={f.banos} onChange={(e) => upd("banos", e.target.value)} placeholder="2" />
        </label>
        <label style={{ fontSize: 12, color: "var(--muted)" }}>Parqueo
          <input style={inp} value={f.parqueo} onChange={(e) => upd("parqueo", e.target.value)} placeholder="1" />
        </label>
      </div>
      <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginTop: 8 }}>Descripción
        <textarea style={{ ...inp, minHeight: 54, resize: "vertical" }} value={f.descripcion} onChange={(e) => upd("descripcion", e.target.value)} placeholder="Sala-comedor, cocina, área de lavado y balcón." />
      </label>

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button className="btn btn-gold btn-sm" onClick={guardar} disabled={busy === "save"}>
          {busy === "save" ? "Guardando…" : "Guardar ficha"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={borrarTipo} disabled={busy === "deltipo"}>Eliminar tipo</button>
      </div>

      {/* Plano */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <b style={{ fontSize: 13 }}>Plano {tipo.plano?.length ? "" : "(sin cargar)"}</b>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            {busy === "plano" ? "Subiendo…" : tipo.plano?.length ? "Reemplazar plano" : "Subir plano"}
            <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => { const x = e.target.files?.[0]; if (x) uploadPlano(x); e.target.value = ""; }} />
          </label>
        </div>
        {tipo.plano?.length ? (
          <div className="admin-fotos">
            {tipo.plano.map((p) => (
              <div className="af" key={p.path}>
                {/\.pdf$/i.test(p.name) ? (
                  <a href={p.url} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 12, color: "var(--ink)" }}>PDF</a>
                ) : (
                  <img src={p.url} alt="" />
                )}
                <button className="af-x" onClick={() => borrar(p.path)} title="Borrar" disabled={busy === "del:" + p.path}>✕</button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Fotos del tipo */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <b style={{ fontSize: 13 }}>Fotos del Tipo {tipo.codigo} ({tipo.fotos?.length || 0})</b>
          <label className="btn btn-gold btn-sm" style={{ cursor: "pointer" }}>
            {busy === "fotos" ? "Subiendo…" : "Subir fotos"}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) uploadFotos(fs); e.target.value = ""; }} />
          </label>
        </div>
        {tipo.fotos?.length ? (
          <div className="admin-fotos">
            {tipo.fotos.map((p) => (
              <div className="af" key={p.path}>
                <img src={p.url} alt="" />
                <button className="af-x" onClick={() => borrar(p.path)} title="Borrar" disabled={busy === "del:" + p.path}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 12.5 }}>Sin fotos de este tipo todavía.</p>
        )}
      </div>
    </div>
  );
}
