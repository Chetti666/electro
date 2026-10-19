# Esquema Estratégico de Monetización y Arquitectura de Usuarios - VMElectric

## 1\. Visión General del Modelo

El objetivo de monetización para VMElectric es capitalizar el tráfico orgánico captado vía SEO (Google Search Console) mediante un **modelo híbrido** que combina una capa gratuita de atracción, micropagos por uso ocasional y una suscripción recurrente (SaaS) para profesionales de alto volumen.

\-------------------------------------------------------------------------------- 

## 2\. Estructura de Capas de Producto (Product Tiers)

### Capa 1: Gratuita (Acceso Libre &amp; Captación SEO)

* **Propósito:** Mantener y hacer crecer el posicionamiento SEO, captar usuarios registrados y generar hábito de uso.
* **Herramientas Incluidas:**
  * Calculadora de Sección de Conductores
  * Calculadora de Caída de Tensión
  * Tabla de Corriente Admisible RIC
  * Buscador de Empalmes Normativos
  * Cálculo General de Corriente
* **Restricciones:** Resultados visibles en pantalla únicamente; sin opción de personalización de marca o exportación en PDF de alta resolución con datos de cliente.

### Capa 2: Micropagos / Pago por Uso (Créditos Ocasionales)

* **Propósito:** Capturar valor de electricistas e ingenieros independientes que requieren documentación oficial de forma puntual para trámites o entregas a clientes.
* **Opciones de Compra:**
  * **Pago Individual:** Compra única por descarga de documento PDF oficial (ej. Informe Fotográfico RIC N°18, Informe de Resistividad SEV o Presupuesto Formateado).
  * **Bolsas de Créditos:** Paquetes con descuento (ej. bolsa de 5, 10 o 20 créditos para exportación de informes).
* **Beneficio del Usuario:** Acceso a documentación normativamente validada sin compromiso de pago recurrente.

### Capa 3: Membresía PRO (Suscripción Recurrente Mensual / Anual)

* **Propósito:** Retener y monetizar a contratistas, empresas instaladoras y electricistas de alto volumen.
* **Beneficios Exclusivos:**
  * Generación e informe ilimitado en PDF (RIC N°18, Resistividad SEV, Inspección, Presupuestos).
  * **Marca Blanca / Personalización:** Inclusión de logo corporativo, firma digital, membrete y datos de contacto en todos los documentos.
  * **Gestión en la Nube:** Historial de proyectos, levantamientos y presupuestos guardados en el perfil de usuario.
  * Herramientas avanzadas adicionales (ej. Generador de Rótulos en lote).

\-------------------------------------------------------------------------------- 

## 3\. Estrategia B2B e Integración con Marcas

* **Catálogos Interactivos:** Vinculación de insumos del Generador de Presupuestos con inventarios de distribuidores eléctricos localizados.
* **Sponsorización de Herramientas:** Alianzas con marcas del sector para el posicionamiento de productos dentro de los cálculos técnicos.

\-------------------------------------------------------------------------------- 

## 4\. Hoja de Ruta de Implementación (Roadmap)

1. **Fase 1 - Autenticación y Cuentas:** Implementación del sistema de registro de usuarios (Auth), panel de control de perfil y guardado de proyectos básicos.
2. **Fase 2 - Pasarela de Pago &amp; Créditos:** Integración de pasarela de pago (ej. Webpay, Stripe o Flow) y lógica de créditos por documento.
3. **Fase 3 - Membresía PRO &amp; Personalización:** Habilitación de suscripciones recurrentes, personalización de informes PDF (logos y firmas) y almacenamiento ilimitado en la nube.
4. **Fase 4 - Optimización B2B:** Alianzas estratégicas con proveedores e integración de catálogos comerciales.