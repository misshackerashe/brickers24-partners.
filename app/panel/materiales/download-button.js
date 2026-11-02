"use client";

import { useState } from "react";
import { getMaterialSignedUrl } from "./actions";

export default function DownloadButton({ materialId, estado, origen }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (estado !== "disponible") {
    return (
      <span className="pill p-perdido" title="Aún no disponible">
        Pendiente · {origen || "CBS"}
      </span>
    );
  }

  async function download() {
    setLoading(true);
    setErr("");
    const res = await getMaterialSignedUrl(materialId);
    setLoading(false);
    if (res.error || !res.url) {
      setErr(res.error || "No se pudo descargar.");
      return;
    }
    window.open(res.url, "_blank", "noopener");
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button className="btn btn-gold btn-sm" onClick={download} disabled={loading}>
        {loading ? "Generando…" : "Descargar"}
      </button>
      {err ? <span style={{ fontSize: 11.5, color: "#c0392b", maxWidth: 220, textAlign: "right" }}>{err}</span> : null}
    </span>
  );
}
