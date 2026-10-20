"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../utils/supabase/config";

export default function ApproveButton({ id }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function approve() {
    setLoading(true);
    setMsg("");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/approve-application`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ application_id: id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.error) {
        setMsg(j.error || "No se pudo aprobar.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch (e) {
      setMsg("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      <button className="btn btn-gold btn-sm" onClick={approve} disabled={loading}>
        {loading ? "Aprobando…" : "Aprobar"}
      </button>
      {msg ? <span style={{ fontSize: 12, color: "#c0392b", maxWidth: 220, textAlign: "right" }}>{msg}</span> : null}
    </div>
  );
}
