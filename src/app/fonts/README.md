# Fuentes locales

Archivos `woff2` del subset **latin** descargados de Google Fonts y servidos con
`next/font/local` desde `src/app/layout.tsx`. Se versionan en el repo para que
`next build` no dependa de la red de Google Fonts (origen del error de Turbopack
`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`).

| Archivo | Fuente | Pesos |
| --- | --- | --- |
| `inter-latin-var.woff2` | Inter (variable) | 300–800 |
| `rajdhani-latin-300…700.woff2` | Rajdhani (estática) | 300, 400, 500, 600, 700 |

Regenerar (requiere red):

```bash
node scripts/download-fonts.mjs
```

Licencias: ambas familias se distribuyen bajo SIL Open Font License 1.1 —
Inter © The Inter Project Authors, Rajdhani © Indian Type Foundry.
