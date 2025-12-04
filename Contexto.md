# Proyecto de Aplicación para Cálculos Eléctricos

## Contexto

Este proyecto está dirigido a técnicos y profesionales del área eléctrica, con el objetivo de proporcionar una interfaz con planillas que faciliten diversos cálculos eléctricos en terreno y sondaje.

## Funcionalidades Existentes

### Calculadoras
1.  **Cálculo de Sección de Conductores**:
    -   Cálculo simple por caída de tensión.
    -   Cálculo por capacidad de corriente según norma RIC N°4.
2.  **Cálculo de Caída de Tensión**:
    -   Cálculo y visualización gráfica de la caída de tensión a lo largo de un conductor.
3.  **Calculadora de Corriente y Potencia**:
    -   Calcula corriente (A) o potencia (W) para sistemas monofásicos y trifásicos.
4.  **Calculadora de Empalmes**:
    -   Selecciona el empalme normalizado según potencia o corriente requerida.
5.  **Generador de Rótulos para Tableros**:
    -   Crea rótulos para tableros eléctricos según la normativa RIC N°02.
### Informes
1.  **Generador de Informe Fotográfico SEC**:
    -   Crea informes fotográficos según el Pliego Técnico Normativo RIC N°18.
2.  **Generador de Informe de Inspección**:
    -   Elabora informes detallados de inspección de instalaciones eléctricas.
3.  **Generador de Informe de Resistividad del Terreno (SEV)**:
    -   Registra mediciones, visualiza la curva y genera un informe de sondeo eléctrico vertical.

## Funcionalidades Requeridas

3.  **Cálculo de Factor de Potencia**:
    -   Medición.
    -   Corrección.
4.  **Cálculo Lumínico**:
5.  **Cálculo de Malla a Tierra**:
6.  **Cálculo de Motores**:
    -   Dimensionamiento.
    -   Protecciones.



## Objetivos del Proyecto

- **Desarrollar una interfaz intuitiva** para técnicos y profesionales eléctricos.
- **Facilitar cálculos precisos** en terreno, minimizando errores manuales.
- **Generar informes técnicos** de los cálculos realizados para documentación y validación.
- **Proporcionar ejemplos prácticos** para cada tipo de cálculo que sirvan como guía.

## Estructura Propuesta

El proyecto se organizará en módulos independientes para cada tipo de cálculo, permitiendo una fácil navegación y uso según las necesidades específicas del usuario.

## Pila Tecnológica (Stack)

- **Framework de Frontend**: **React (con Next.js)** para construir una interfaz de usuario moderna, reactiva y con renderizado del lado del servidor.
- **Generación de Informes**: Para la exportación de resultados.
  - Opciones: Librerías para generar PDF como `jsPDF` o `PDF-lib`, o exportar a formatos como CSV.
- **Almacenamiento de Datos**: Para guardar proyectos y la base de datos de materiales.
  - Opciones: Una base de datos ligera como SQLite, o un sistema de archivos basado en JSON.
- **Lenguaje de Programación**:
   - **TypeScript** para un desarrollo robusto, escalable y con tipado estático.
- **Generación de Informes**: Librerías del lado del cliente como **jsPDF** y **html2canvas** para la exportación de resultados a formato PDF e imagen.
- **Almacenamiento de Archivos de Usuario**:
  - **API de Google Drive**: Se utiliza para que los usuarios puedan guardar y gestionar los informes y documentos generados directamente en su cuenta personal de Google Drive. Esto delega la responsabilidad del almacenamiento y la privacidad de los datos al usuario.
- **Estilos**: **Tailwind CSS** para un diseño rápido y personalizable basado en utilidades.

  ## Próximos Pasos

1.  **Diseñar el Mockup/UI**: Crear un diseño visual de la interfaz para las nuevas funcionalidades.
2.  **Desarrollar Módulos Faltantes**: Implementar las calculadoras de "Factor de Potencia", "Cálculo Lumínico", etc.
3.  **Refactorizar y Optimizar**: Revisar el código existente para mejorar la reutilización de componentes y la performance.
4.  **Documentación para Desarrolladores**: Detallar la arquitectura y el flujo de la integración con la API de Google Drive.