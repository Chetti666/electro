# Plan: Registro de clientes + Panel de control + Donaciones

> Basado en `monetizacion.md` (Fase 1 y adelanto de Fase 2) y en el estado actual del proyecto.
> Decisiones acordadas:
> - Guardar los datos del informe y regenerar el PDF (no se almacena el PDF).
> - `/signup` pasa a ser registro público y la gestión de usuarios se mueve a `/admin/usuarios`.
> - El rol de cliente se representa con `USER` y se muestra como “Cliente” en la interfaz.
> - El historial de cálculos se guarda automáticamente para usuarios con sesión.
> - Fase 2 se inicia con un sistema de donaciones vía Flow.cl. Membresías, créditos y compra de PDFs quedan para una etapa posterior.

---

## 1. Base de datos (Prisma)

### Relaciones nuevas en `User`

```prisma
calculations Calculation[]
reports      SavedReport[]
```

### Nuevos modelos

```prisma
enum CalculationType {
  SECCION
  CAIDA_TENSION
  CORRIENTE_POTENCIA
  EMPALME
  SECCION_RIC
}

enum ReportType {
  PRESUPUESTO
  RESISTIVIDAD_SEV
  FOTOGRAFICO_RIC18
  INSPECCION
}

model Calculation {
  id        Int             @id @default(autoincrement())
  userId    Int
  type      CalculationType
  title     String?
  input     Json
  result    Json
  createdAt DateTime        @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

model SavedReport {
  id         Int        @id @default(autoincrement())
  userId     Int
  type       ReportType
  title      String
  clientName String?
  reference  String?
  data       Json
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

- Migración: `npx prisma migrate dev --name add_client_history_reports`.
- Al borrar un usuario se eliminan sus cálculos e informes en cascada.

---

## 2. Autenticación y seguridad

### `src/lib/auth.ts`
- Exportar `SessionUser`.
- Agregar `requireUser()`.
- Agregar helper para serializar la sesión y opciones de cookie.
- Mantener `requireAdmin()`.

### Nuevas rutas

| Ruta | Método | Función |
|---|---|---|
| `/api/auth/register` | POST | Registro público. Fuerza `role: USER`, valida, hashea con bcrypt, crea cookie. |
| `/api/auth/logout` | POST | Elimina `session_token`. |
| `/api/auth/profile` | PUT | Actualiza nombre/email y contraseña verificando la actual. |

### Correcciones de seguridad
- Proteger `/api/users` y `/api/users/[id]` con `requireAdmin()`.
- Mover la gestión de usuarios de `/signup` a `/admin/usuarios`.
- `/signup` queda como registro público de clientes.
- Actualizar `middleware.ts`: quitar `/signup`, proteger `/panel` y `/admin`.
- Login redirige según rol: `ADMIN` → `/admin`, `USER` → `/panel`.

### `/signup` (registro público)
- Campos: nombre, email, contraseña, confirmar contraseña, aceptación de términos.
- Validaciones: email válido, contraseña mínimo 8 caracteres, coincidencia, email no duplicado.
- Al registrarse inicia sesión y redirige a `/panel`.

---

## 3. Sesión en la interfaz

### `src/components/Header.tsx`
- Consultar `/api/auth/me`.
- Sin sesión: “Ingresar” + “Crear cuenta”.
- Con sesión: “Mi Panel” + “Salir”.
- Logout con `POST /api/auth/logout` y redirección a `/`.

---

## 4. Panel del cliente `/panel`

```
src/app/panel/
  layout.tsx
  page.tsx
  historial/page.tsx
  informes/page.tsx
  perfil/page.tsx
```

- Layout con guard de sesión; `ADMIN` se redirige a `/admin`.
- `/panel`: contadores y actividad reciente.
- `/panel/historial`: historial, filtros, eliminar uno o todos.
- `/panel/informes`: informes guardados, abrir/eliminar, filtro por tipo.
- `/panel/perfil`: nombre, email y cambio de contraseña.

---

## 5. Historial automático de cálculos

### API

| Ruta | Método | Función |
|---|---|---|
| `/api/calculations` | GET | Lista los cálculos del usuario autenticado. |
| `/api/calculations` | POST | Crea un cálculo para el usuario autenticado. |
| `/api/calculations/[id]` | DELETE | Elimina un cálculo propio. |
| `/api/calculations` | DELETE | Vacía el historial del usuario. |

- `userId` siempre sale de la sesión.
- Validación de `type` y límite de payload (~64 KB).

### Cliente
- Hook `useCalculationRecorder`.
- Integración en: Sección, Caída de Tensión, Corriente/Potencia, Empalmes y Sección RIC.
- Usuarios anónimos mantienen el historial local sin errores.

---

## 6. Guardado de informes

### Estrategia
Guardar el JSON completo del informe en PostgreSQL. Desde el panel se reabre el generador con los datos cargados y se regenera el PDF.

### API

| Ruta | Método | Función |
|---|---|---|
| `/api/reports` | GET | Lista informes propios sin `data`. |
| `/api/reports` | POST | Crea un informe propio. |
| `/api/reports/[id]` | GET | Obtiene un informe propio con `data`. |
| `/api/reports/[id]` | PUT | Actualiza un informe propio. |
| `/api/reports/[id]` | DELETE | Elimina un informe propio. |

- Verificación de propiedad con `userId`.
- Límite configurable con `MAX_REPORT_DATA_MB` (por defecto 8 MB).

### Integración en generadores

| Generador | Datos a guardar | Título sugerido |
|---|---|---|
| Presupuesto | `yourInfo`, `clientInfo`, `quoteInfo`, `terms`, `items` | `Presupuesto N° {number} - {clientName}` |
| Informe Fotográfico | `projectName`, `projectAddress`, `installerName`, `reportDate`, `sections` | `Informe Fotográfico - {projectName}` |
| Informe de Inspección | `reportDetails`, `inspectionPoints` | `Inspección - {clientName}` |
| Resistividad SEV | datos del proyecto, mediciones, `annexImages` | `SEV - {projectName}` |

- Botón “Guardar en mi panel”.
- Con `?reportId=` se cargan los datos guardados y se permite actualizar/regenerar.

---

## 7. Archivos previstos

### Nuevos
```
prisma/migrations/..._add_client_history_reports/
src/app/panel/layout.tsx
src/app/panel/page.tsx
src/app/panel/historial/page.tsx
src/app/panel/informes/page.tsx
src/app/panel/perfil/page.tsx
src/app/admin/usuarios/page.tsx
src/app/api/auth/register/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/profile/route.ts
src/app/api/calculations/route.ts
src/app/api/calculations/[id]/route.ts
src/app/api/reports/route.ts
src/app/api/reports/[id]/route.ts
src/components/panel/PanelSidebarNav.tsx
src/components/panel/LogoutButton.tsx
src/components/panel/CalculationHistoryList.tsx
src/components/panel/ReportsList.tsx
src/components/panel/ProfileForm.tsx
src/components/informes/SaveReportButton.tsx
src/hooks/useCalculationRecorder.ts
src/hooks/useReportSaver.ts
src/lib/calculation-types.ts
src/lib/report-types.ts
src/lib/report-client.ts
src/lib/flow.ts
src/lib/donations.ts
src/lib/donation-config.ts
src/app/donar/layout.tsx
src/app/donar/page.tsx
src/app/donar/gracias/page.tsx
src/app/api/donations/route.ts
src/app/api/donations/confirm/route.ts
src/app/api/donations/return/route.ts
src/app/admin/donaciones/page.tsx
.env.example
```

### Modificados
```
prisma/schema.prisma
src/lib/auth.ts
src/middleware.ts
src/app/signup/page.tsx
src/app/login/page.tsx
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/components/Header.tsx
src/components/Footer.tsx
src/components/AdminSidebarNav.tsx
src/components/BottomNav.tsx (opcional)
src/app/sitemap.ts
AGENTS.md
.gitignore
src/app/api/users/route.ts
src/app/api/users/[id]/route.ts
src/app/calculadoras/seccion/page.tsx
src/app/calculadoras/caida-tension/page.tsx
src/app/calculadoras/calculadora-corriente/page.tsx
src/app/calculadoras/empalmes/page.tsx
src/app/calculadoras/seccion-ric/page.tsx
src/app/informes/presupuesto/page.tsx
src/app/informes/informe-fotografico/page.tsx
src/app/informes/informe-inspeccion/page.tsx
src/app/informes/informe-resistividad/SevReport.tsx
```

---

## 8. Verificación

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (requiere PostgreSQL activo)
- Flujo manual:
  1. Registro público crea usuario `USER` y entra a `/panel`.
  2. Cliente no puede acceder a `/admin`.
  3. Admin gestiona usuarios desde `/admin/usuarios`.
  4. `/api/users` responde `401` sin sesión de admin.
  5. Cálculo con sesión aparece en `/panel/historial`.
  6. Cálculo anónimo no genera errores.
  7. Informe guardado aparece en `/panel/informes`.
  8. Abrir un informe guardado carga los datos y regenera el PDF.
  9. Eliminar un usuario elimina sus cálculos e informes.
  10. Logout limpia la sesión y redirige.
  11. El botón “Apoyar” aparece en el header (móvil y escritorio) y en el footer.
  12. `/donar` rechaza montos fuera de rango y correos inválidos.
  13. Una donación válida crea `Donation` en `PENDING` y redirige al checkout de Flow.
  14. Con el pago de prueba, el webhook deja la donación en `PAID` y `/donar/gracias` lo refleja.
  15. `/admin/donaciones` muestra el total recaudado y el historial.
  16. Si Flow no está configurado, `/api/donations` responde `502` sin crear una orden huérfana.

---

## 9. Donaciones con Flow

### Objetivo

Permitir aportes voluntarios únicos para mantener gratuitas las herramientas, sin exigir una cuenta y sin almacenar datos de tarjetas. Flow procesa el checkout y VMElectric solo recibe la confirmación.

### Decisiones

- Montos sugeridos: `$1.000`, `$3.000`, `$5.000` y `$10.000` CLP.
- Monto libre permitido entre `$500` y `$1.000.000` CLP (entero).
- Pago único, no recurrente. Las suscripciones se abordarán en la fase de membresías.
- La donación se guarda en `Donation` con estados `PENDING`, `PAID`, `REJECTED` y `CANCELLED`.
- Si hay sesión, se asocia al usuario con `userId`; si no, queda anónima con el email ingresado.
- El estado se actualiza por el webhook de Flow y se vuelve a verificar al abrir `/donar/gracias`.
- El formulario permite nombre y mensaje opcionales (máx. 80 y 300 caracteres), útiles para el panel admin.

### Modelo Prisma

```prisma
enum DonationStatus {
  PENDING
  PAID
  REJECTED
  CANCELLED
}

model Donation {
  id            Int            @id @default(autoincrement())
  commerceOrder String         @unique
  token         String?        @unique
  flowOrder     Int?
  amount        Int
  currency      String         @default("CLP")
  email         String
  name          String?
  message       String?
  status        DonationStatus @default(PENDING)
  payer         String?
  paymentData   Json?
  userId        Int?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([status, createdAt])
  @@index([userId, createdAt])
}
```

- Migración: `prisma/migrations/20261020120000_add_donations/`.
- `userId` es opcional: las donaciones anónimas no dependen de una cuenta.

### Variables de entorno

| Variable | Uso |
|---|---|
| `FLOW_API_KEY` | API Key del comercio (Flow → Mis datos → Integraciones). |
| `FLOW_SECRET_KEY` | Secret key usada para firmar cada request. |
| `FLOW_ENV` | `sandbox` (por defecto) o `production`. |
| `NEXT_PUBLIC_SITE_URL` | URL pública para construir `urlConfirmation` y `urlReturn`. |

- Sandbox: `https://sandbox.flow.cl/api` · Producción: `https://www.flow.cl/api`.
- En producción, `NEXT_PUBLIC_SITE_URL=https://vmelectric.cl`.
- `urlConfirmation` debe ser accesible públicamente. Para probar en local se necesita un túnel y apuntar `NEXT_PUBLIC_SITE_URL` a esa URL; `localhost` no recibe el webhook de Flow.
- Ejemplo con Cloudflare Tunnel (gratis, sin cuenta para túneles rápidos):

  ```bash
  # Terminal 1
  npm run dev

  # Terminal 2
  cloudflared tunnel --url http://localhost:3000
  ```

  Copiar la URL `https://xxxx.trycloudflare.com` que imprime `cloudflared` y usarla en `.env.local`:

  ```bash
  NEXT_PUBLIC_SITE_URL="https://xxxx.trycloudflare.com"
  ```

  Reiniciar `npm run dev` después de cambiar la variable. La URL del túnel cambia cada vez que se reinicia `cloudflared`; actualizarla y reiniciar Next.
- Si el sitio ya está desplegado en Vercel, usar la URL pública del despliegue (por ejemplo `https://vmelectric.cl` o la URL de preview) en vez del túnel.
- Las credenciales de sandbox se obtienen registrándose en `sandbox.flow.cl`, no en la cuenta de producción.

### Firma de requests

Todos los parámetros (body o query) se firman con `FLOW_SECRET_KEY`:

1. Ordenar las claves alfabéticamente.
2. Concatenar `clave + valor` sin separadores.
3. Calcular `HMAC-SHA256` y enviar el hex en el parámetro `s`.

Implementado en `src/lib/flow.ts` para `POST /payment/create` y `GET /payment/getStatus`.

### API

| Ruta | Método | Función |
|---|---|---|
| `/api/donations` | POST | Público. Valida monto/email, crea `Donation` y la orden en Flow. Devuelve `{ url, token }`. Si Flow falla, marca la donación como `CANCELLED` y responde `502`. |
| `/api/donations/confirm` | POST | Webhook de Flow (`application/x-www-form-urlencoded`, campo `token`). Consulta `getStatus`, valida `commerceOrder` y monto, actualiza el estado y responde `200` en menos de 15 s. |
| `/api/donations/return` | POST | Retorno del navegador desde Flow. Sincroniza el estado y redirige con `303` a `/donar/gracias?token=...`. |
| `/donar/gracias` | GET | Página server-side que vuelve a consultar Flow y muestra el estado final. |

Estados de Flow: `1` pendiente, `2` pagada, `3` rechazada, `4` anulada.

### Interfaz

- `src/app/donar/page.tsx`: selector de montos, monto libre, nombre/email/mensaje y redirección a Flow.
- `src/app/donar/gracias/page.tsx`: resultado de la donación con monto, correo, fecha y orden Flow.
- Botón “Apoyar” en `Header` (icono en móvil, icono + texto en escritorio) y CTA en `Footer`.
- `/admin/donaciones`: total recaudado, pagadas, pendientes e historial de las últimas 200 donaciones.
- Acceso desde el sidebar de admin y desde una acción rápida del dashboard.

### Pruebas en sandbox

1. Registrar una cuenta de comercio en `https://sandbox.flow.cl`.
2. Copiar API Key y Secret Key en `.env.local` y dejar `FLOW_ENV="sandbox"`.
3. Exponer el sitio con un túnel y definir `NEXT_PUBLIC_SITE_URL` con esa URL pública.
4. Donar desde `/donar` y pagar con la tarjeta de prueba de Flow:
   - Tarjeta: `4051885600446623`, vencimiento `11/27`, CVV `123`.
   - Si el banco simulado lo pide: RUT `11111111-1`, clave `123`.
5. Verificar `Donation.status = PAID` y la vista `/donar/gracias`.
6. Revisar `/admin/donaciones`.
7. Repetir con un monto inválido y un correo inválido para confirmar los `400`.

### Seguridad y pendientes

- El monto se valida en el servidor; el webhook no confía en el estado enviado por el navegador.
- Se verifica que `commerceOrder` y `amount` informados por Flow coincidan con la donación antes de marcar `PAID`.
- El webhook es público por diseño (Flow no envía credenciales propias), pero solo puede modificar donaciones existentes usando un token válido.
- Pendiente antes de producción: rate limiting por IP/email, reintentos/auditoría del webhook, notificación por email al recibir una donación y exportación de donaciones.
- Las membresías y créditos reutilizarán `Donation` solo como referencia de pagos; se necesitará un modelo de suscripción/plan independiente.

---

## 10. Fuera de alcance (Fases 2 y 3)

- Membresías PRO, créditos y compra de PDFs.
- Suscripciones recurrentes con Flow, marca blanca, logo/firma en PDF.
- Verificación de email, recuperación de contraseña y rate limiting.
- Almacenamiento de PDFs o integración obligatoria con Google Drive.
- Panel avanzado de donaciones (exportación, conciliación y reportes).
