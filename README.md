# Brickers24 Partners — Portal interno

Panel privado de la red de partners de Brickers24 (Next.js + Supabase).

- **Login:** Supabase Auth (correo + contraseña) + reCAPTCHA opcional.
- **Catálogo:** lee la tabla `properties` (espejo sincronizado desde WordPress).
- **Mis compradores:** registra en `buyer_leads` con constancia de fecha/hora y dedupe.
- **Comisiones, materiales y agencia:** por partner, con RLS (cada agencia ve solo lo suyo).

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://unfgsuzjldcvsbbllpqw.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la llave pública (`sb_publishable_...`) del proyecto Supabase |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | *(opcional)* site key de Google reCAPTCHA v2 |
| `RECAPTCHA_SECRET` | *(opcional)* secret de reCAPTCHA v2 |

Si no se configura reCAPTCHA, el login usa una casilla simple de verificación.

## Desarrollo local

```bash
cp .env.example .env.local   # completa las variables
npm install
npm run dev
```

## Despliegue

Proyecto pensado para Vercel (framework Next.js, sin configuración extra).
Cada push a `main` despliega automáticamente.
