"use client";

import { useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { registerLead } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-gold" type="submit" disabled={pending}>
      {pending ? "Registrando…" : "Registrar a mi nombre"}
    </button>
  );
}

export default function RegisterForm({ properties }) {
  const [state, formAction] = useFormState(registerLead, { ok: false, error: "" });
  const dialogRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      dialogRef.current?.close();
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <button className="btn btn-gold" onClick={() => dialogRef.current?.showModal()}>
        ＋ Registrar comprador
      </button>
      <dialog ref={dialogRef}>
        <div className="box">
          <div className="mh">
            <h3>Registrar comprador</h3>
            <button className="mx" onClick={() => dialogRef.current?.close()} aria-label="Cerrar">✕</button>
          </div>
          <form action={formAction} className="mform">
            {state.error ? <div className="auth-err full">{state.error}</div> : null}
            <label className="full">Nombre del comprador
              <input name="nombre" required placeholder="Nombre y apellidos" />
            </label>
            <label>Correo<input name="email" type="email" placeholder="correo@ejemplo.com" /></label>
            <label>Teléfono<input name="telefono" type="tel" placeholder="+34 ..." /></label>
            <label className="full">Proyecto de interés
              <select name="property_id" required defaultValue="">
                <option value="" disabled>Selecciona un proyecto</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.proyecto}</option>
                ))}
              </select>
            </label>
            <label className="full">Notas
              <textarea name="notas" rows={2} placeholder="Contexto del comprador (opcional)"></textarea>
            </label>
            <div className="protect">
              <span>🔒</span>
              <span>Al registrar, el comprador queda <b>a tu nombre con fecha y hora</b>. Comprobamos duplicados automáticamente.</span>
            </div>
            <div className="mfoot">
              <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>Cancelar</button>
              <Submit />
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
