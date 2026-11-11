"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { markMaterialAvailable } from "./actions";

const EXT_TIPO = { pdf: "pdf", zip: "zip", mp4: "mp4" };
function tipoFromName(name) {
  const e = (name.split(".").pop() || "").toLowerCase();
  return EXT_TIPO[e] || null;
}
function sanitize(name) {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function AdminMaterials({ projects }) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);

  async function uploadDoc(proj, mat, file) {
    setMsg(null);
    setBusy("doc:" + mat.id);
    try {
      const path = mat.storage_path || `${proj.slug}/docs/${mat.id}-${sanitize(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from("materiales")
        .upload(path, file, { upsert: true, contentType: file.type || undefined });
      if (upErr) throw upErr;
      const res = await markMaterialAvailable(mat.id, path, tipoFromName(file.name));
      if (res.error) throw new Error(res.error);
      setMsg({ type: "ok", text: `"${mat.titulo}" subido a ${proj.proyecto}.` });
      router.refresh();
    } catch (e) {
      setMsg({ type: "err", text: `No se pudo subir: ${e.message || e}` });
    }
    setBusy("");
  }

  async function uploadFotos(proj, files) {
    setMsg(null);
    setBusy("fotos:" + proj.id);
    let ok = 0;
    const errs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${proj.slug}/fotos/${Date.now()}-${i}-${rand}-${sanitize(file.name)}`;
      const { error } = await supabase.storage
        .from("materiales")
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (error) errs.push(`${file.name}: ${error.message}`);
      else ok++;
    }
    if (ok > 0) {
      setMsg({ type: "ok", text: `${ok} foto(s) subida(s) a ${proj.proyecto}.${errs.length ? ` (${errs.length} fallaron)` : ""}` });
    } else if (errs.length) {
      setMsg({ type: "err", text: `No se pudo subir: ${errs[0]}` });
    }
    setBusy("");
    router.refresh();
  }

  async function deleteFoto(proj, path) {
    setBusy("del:" + path);
    try {
      const { error } = await supabase.storage.from("materiales").remove([path]);
      if (error) throw error;
      router.refresh();
    } catch (e) {
      setMsg({ type: "err", text: `No se pudo borrar: ${e.message || e}` });
    }
    setBusy("");
  }

  return (
    <>
      {msg ? (
        <div className={msg.type === "ok" ? "ok show" : "auth-err"} style={{ marginBottom: 16 }}>{msg.text}</div>
      ) : null}

      {projects.map((proj) => (
        <div className="panel-c" key={proj.id} style={{ marginBottom: 20 }}>
          <div className="panel-head"><h3>{proj.proyecto}</h3></div>

          {/* Documentación */}
          <div className="list">
            {proj.materiales.map((mat) => (
              <div className="row-item" key={mat.id}>
                <div className="ri-main">
                  <b>{mat.titulo}</b>
                  <div className="matmeta">
                    <span className={`lvl ${mat.nivel}`}>{mat.nivel === "share" ? "Para compartir" : "Interno"}</span>
                    <span className={`pill ${mat.estado === "disponible" ? "p-reserva" : "p-perdido"}`}>
                      {mat.estado === "disponible" ? "Disponible" : `Pendiente · ${mat.origen_pendiente || "CBS"}`}
                    </span>
                  </div>
                </div>
                <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
                  {busy === "doc:" + mat.id ? "Subiendo…" : mat.estado === "disponible" ? "Reemplazar" : "Subir"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadDoc(proj, mat, f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Fotos */}
          <div style={{ padding: "14px 16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <b style={{ fontSize: 14 }}>Fotos del proyecto ({proj.fotos.length})</b>
              <label className="btn btn-gold btn-sm" style={{ cursor: "pointer" }}>
                {busy === "fotos:" + proj.id ? "Subiendo…" : "Subir fotos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    const fs = Array.from(e.target.files || []);
                    if (fs.length) uploadFotos(proj, fs);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {proj.fotos.length > 0 ? (
              <div className="admin-fotos">
                {proj.fotos.map((f) => (
                  <div className="af" key={f.path}>
                    <img src={f.url} alt="" />
                    <button className="af-x" onClick={() => deleteFoto(proj, f.path)} title="Borrar" disabled={busy === "del:" + f.path}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Aún no hay fotos. Sube solo fotos reales de lo construido (no renders).</p>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
