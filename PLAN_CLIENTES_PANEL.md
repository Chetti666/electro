# Plan: Registro de clientes + Panel de control

> Basado en `monetizacion.md` (Fase 1) y en el estado actual del proyecto.
> Decisiones acordadas:
> - Guardar los datos del informe y regenerar el PDF (no se almacena el PDF).
> - `/signup` pasa a ser registro público y la gestión de usuarios se mueve a `/admin/usuarios`.
> - El rol de cliente se representa con `USER` y se muestra como “Cliente” en la interfaz.
> - El historial de cálculos se guarda automáticamente para usuarios con sesión.

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
src/components/AdminSidebarNav.tsx
src/components/BottomNav.tsx (opcional)
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

---

## 9. Fuera de alcance (Fases 2 y 3)

- Pasarela de pago, créditos y compra de PDFs.
- Suscripción PRO, marca blanca, logo/firma en PDF.
- Verificación de email, recuperación de contraseña y rate limiting.
- Almacenamiento de PDFs o integración obligatoria con Google Drive.
