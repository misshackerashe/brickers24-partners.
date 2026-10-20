"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [checked, setChecked] = useState(false);
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);

  // Google reCAPTCHA v2 (sólo si hay site key configurada)
  useEffect(() => {
    if (!SITE_KEY) return;
    const id = "recaptcha-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    const t = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render && captchaRef.current && !captchaRef.current.dataset.rendered) {
        window.grecaptcha.render(captchaRef.current, {
          sitekey: SITE_KEY,
          callback: (tk) => setToken(tk),
          "expired-callback": () => setToken(""),
        });
        captchaRef.current.dataset.rendered = "1";
        clearInterval(t);
      }
    }, 300);
    return () => clearInterval(t);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !pass.trim()) {
      setErr("Escribe tu correo y contraseña.");
      return;
    }
    if (SITE_KEY ? !token : !checked) {
      setErr('Completa la verificación "No soy un robot".');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
    setLoading(false);
    if (error) {
      setErr("Correo o contraseña incorrectos.");
      if (SITE_KEY && window.grecaptcha) window.grecaptcha.reset();
      setToken("");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="login">
      <div className="login__art">
        <span className="logo" style={{ color: "#fff" }}>
          brickers<span className="t">24</span>
          <small style={{ color: "#cdd5ee" }}>Partners</small>
        </span>
        <div>
          <h2>El panel privado de la red de partners</h2>
          <p>Catálogo verificado, registro de compradores a tu nombre y comisiones por proyecto — todo en un solo lugar.</p>
          <div className="feats">
            <div><span className="tick">✓</span> Proyectos verificados de República Dominicana</div>
            <div><span className="tick">✓</span> Tus compradores protegidos con fecha y hora</div>
            <div><span className="tick">✓</span> Comisiones y materiales siempre al día</div>
          </div>
        </div>
      </div>
      <div className="login__form">
        <div className="card-auth">
          <span className="logo-chip"><img src="/logo.png" alt="Brickers24 Partners" /></span>
          <h1>Acceso partners</h1>
          <p className="sub">Entra con la cuenta de tu inmobiliaria.</p>
          {err ? <div className="auth-err">{err}</div> : null}
          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Correo profesional</label>
              <input id="email" type="email" autoComplete="username" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@inmobiliaria.com" />
            </div>
            <div className="field">
              <label htmlFor="pass">Contraseña</label>
              <input id="pass" type="password" autoComplete="current-password" value={pass}
                onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
            </div>
            {SITE_KEY ? (
              <div ref={captchaRef} style={{ marginBottom: 18 }} />
            ) : (
              <div className="recaptcha">
                <input id="captcha" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <span className="lbl">No soy un robot</span>
                <span className="brand"><b>reCAPTCHA</b>Privacidad · Términos</span>
              </div>
            )}
            <button className="btn btn-gold" type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Entrando…" : "Entrar al panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
