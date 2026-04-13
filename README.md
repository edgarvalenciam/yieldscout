# Redito

Comparador de rendimientos: stablecoins DeFi (DeFiLlama) frente a referencias soberanas (CETES, Letras). Next.js App Router, TypeScript, Tailwind.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
```

## Variables de entorno

Copia `.env.example` a `.env.local` y ajusta valores. En producción, define las mismas variables en el panel de Vercel (ver abajo).

## Despliegue en Vercel (Stage 5)

1. **Repositorio Git**  
   Sube el proyecto a GitHub/GitLab/Bitbucket si aún no está en remoto.

2. **Importar en Vercel**  
   [vercel.com/new](https://vercel.com/new): elige el repo, framework Next.js detectado automáticamente.

3. **Variables de entorno en Vercel**  
   Project → Settings → Environment Variables:

   | Variable | Uso |
   |----------|-----|
   | `NEXT_PUBLIC_SITE_URL` | URL de producción (ej. `https://tu-proyecto.vercel.app`) para `metadataBase` y enlaces correctos. |
   | `FEEDBACK_WEBHOOK_URL` | Opcional: reenvío del formulario de feedback a un webhook. |

4. **CLI (alternativa)**  
   Con [Vercel CLI](https://vercel.com/docs/cli): `npx vercel` (login interactivo la primera vez), luego `npx vercel --prod`.

## QA en producción

Checklist manual en [`plan.md`](./plan.md) (sección **Stage 5 — Deploy & QA**): pools en vivo, monedas, tooltips, CETES/Letras, calculadora, feedback, alert CTA, móvil ~375px, disclaimer, sin errores en consola.

## Benchmarks

CETES se actualiza desde Banxico vía `/api/cetes` (token `BANXICO_TOKEN`). Letras del Tesoro: `LETRAS_BENCHMARK` en `src/lib/constants.ts` (revisión periódica manual según el plan).
