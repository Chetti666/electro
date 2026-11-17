/**
 * Contenido de las guías interactivas de las calculadoras.
 *
 * Cada paso apunta a un elemento mediante un selector CSS (o varios, se usa el
 * primero que exista en la página). Si ninguno existe, la guía muestra el paso
 * centrado en pantalla, sin resaltado.
 *
 * Los textos se editan acá una sola vez: `CalculatorTour` los consume según el
 * `guideId` de cada calculadora.
 */

export type TourStep = {
  target: string | readonly string[];
  /** Selector de respaldo si el objetivo no está en pantalla (campos condicionales). */
  fallback?: string;
  title: string;
  body: string;
};

export const CALCULATOR_GUIDES = {
  seccion: [
    {
      target: '[data-tour="seccion-sistema"]',
      title: '¿Monofásico o trifásico?',
      body: 'Monofásico (220 V) para casas, oficinas e iluminación. Trifásico (380 V) para motores, talleres y tableros de fuerza. La fórmula cambia según el sistema.',
    },
    {
      target: '#Vn',
      title: 'Tensión nominal',
      body: 'Se usa para los atajos de 3 % y 5 %. Si tu red es 127 V (México) o 240 V, escríbela aquí; si la dejas vacía se asume 220 V o 380 V.',
    },
    {
      target: '#L',
      title: 'Largo del circuito',
      body: 'Distancia desde el tablero hasta la carga, en metros. Ingresa solo la ida: la calculadora ya considera el retorno del conductor.',
    },
    {
      target: '#I',
      title: 'Corriente de la carga',
      body: 'El consumo en amperios. Si solo tienes la potencia usa I = P ÷ (V × cosφ). Ejemplo: 2.000 W en 220 V con cosφ 1 son unos 9 A.',
    },
    {
      target: '#Vp',
      title: 'Caída de tensión permitida',
      body: 'Escribe la caída en volts o usa los atajos: 3 % para circuitos y 5 % para alimentadores. Con 220 V, el 3 % equivale a 6,6 V.',
    },
    {
      target: 'button[type="submit"]',
      title: 'Calcula y guarda',
      body: 'El resultado se actualiza mientras escribes. Pulsa «Calcular» y después «Guardar cálculo» para conservarlo en el historial y en tu cuenta.',
    },
  ],
  'caida-tension': [
    {
      target: '#tipoCalculo',
      title: 'Sistema de la instalación',
      body: 'Monofásico (220 V) o trifásico (380 V). Define si la caída se calcula con factor 2 o con √3.',
    },
    {
      target: '#Vn',
      title: 'Tensión nominal',
      body: 'El porcentaje de caída se calcula sobre este valor. Ajusta 127 V, 220 V, 240 V o la tensión de tu país; vacío usa 220 V o 380 V.',
    },
    {
      target: '#S',
      title: 'Sección del conductor',
      body: 'Escribe los mm² o usa los botones rápidos. La fila AWG carga la sección comercial equivalente: 12 AWG ≈ 3,31 mm².',
    },
    {
      target: '#L',
      title: 'Longitud del circuito',
      body: 'Distancia tablero-carga en metros, solo la ida. A mayor largo, mayor caída de tensión.',
    },
    {
      target: '#I',
      title: 'Corriente',
      body: 'Amperios que circulan por el conductor. Si solo tienes la potencia: I = P ÷ (V × cosφ).',
    },
    {
      target: 'button[type="submit"]',
      title: 'Lee el resultado',
      body: 'Obtendrás la caída en volts y %, si cumple el límite del 3 % y la longitud máxima admisible para esa sección y corriente.',
    },
  ],
  corriente: [
    {
      target: '#objetivo',
      title: '¿Qué quieres obtener?',
      body: 'Elige «Corriente» si conoces la potencia (W o kW) y necesitas amperios; elige «Potencia» si conoces la corriente y quieres watts.',
    },
    {
      target: '#tipoSistema',
      title: 'Monofásico o trifásico',
      body: 'En monofásico se usa P = V × I × cosφ; en trifásico se agrega √3. Elige el mismo sistema del equipo o tablero.',
    },
    {
      target: ['#P', '#I'],
      title: 'Potencia o corriente',
      body: 'Escribe el dato que tengas. En potencia puedes alternar W y kW con los botones de la derecha (1 kW = 1.000 W).',
    },
    {
      target: '#V',
      title: 'Voltaje',
      body: 'Tensión entre fase y neutro (220 V) o entre fases (380 V). Usa los atajos o escribe la tensión real de tu red.',
    },
    {
      target: '#cosPhi',
      title: 'Factor de potencia',
      body: '1 para cargas resistivas (calefacción, ampolletas). 0,9 es habitual con motores y 0,85 en equipos antiguos. Mientras más bajo, más corriente para la misma potencia.',
    },
    {
      target: 'button[type="submit"]',
      title: 'Calcula y guarda',
      body: 'El resultado aparece al completar los datos. Pulsa «Calcular» y luego «Guardar cálculo» para conservarlo en tu historial.',
    },
  ],
  empalmes: [
    {
      target: '[data-tour="empalmes-metodo"]',
      title: 'Calcula por potencia o corriente',
      body: 'Usa «Potencia (kW)» si el dato viene del proyecto eléctrico, o «Corriente (A)» si ya lo tienes del equipo.',
    },
    {
      target: '#tipoInstalacion',
      title: 'Tipo de instalación',
      body: 'Trifásica para empalmes con las tres fases (fuerza) y monofásica para viviendas y cargas simples.',
    },
    {
      target: ['#potencia', '#corriente'],
      title: 'Dato de entrada',
      body: 'En potencia acepta coma decimal (ej. 20,5 kW). En corriente escribe los amperios de servicio (ej. 32 A).',
    },
    {
      target: 'button[type="submit"]',
      title: 'Obtén el empalme',
      body: 'Verás el tipo de empalme normalizado, el interruptor termomagnético y la potencia a contratar. Para viviendas la protección mínima es de 25 A.',
    },
  ],
  'seccion-ric': [
    {
      target: '#conductorSelect',
      title: 'Tipo de conductor',
      body: 'Elige el conductor según su aislamiento y uso (por ejemplo THHN, XLPE o móvil). De él depende la tabla de la RIC N°4 que se aplica.',
    },
    {
      target: '#corriente',
      fallback: '[data-tour="ric-form"]',
      title: 'Corriente del circuito',
      body: 'Amperios que debe soportar el conductor. La calculadora busca la sección mínima cuya capacidad admisible sea igual o mayor.',
    },
    {
      target: '#metodoInstalacion',
      fallback: '[data-tour="ric-form"]',
      title: 'Método de instalación',
      body: 'Canalizado, embutido, al aire o bajo aislación: cada método tiene su propia capacidad de corriente en la tabla RIC.',
    },
    {
      target: 'button[type="submit"]',
      fallback: '[data-tour="ric-form"]',
      title: 'Calcula la sección',
      body: 'Verás la sección mínima, su equivalente AWG y la tabla de origen. Si el conductor es móvil, el método se fija automáticamente.',
    },
  ],
  rotuladora: [
    {
      target: '#fabricante',
      title: 'Identifica el tablero',
      body: 'Marca de fabricación y nombre del tablero (por ejemplo «TGAux A. y F.»). Ambos se imprimen en el rótulo.',
    },
    {
      target: '#servicio',
      title: 'Servicio, tensión y corriente',
      body: 'Indica si el tablero es Normal o de Emergencia, su tensión (220/380 V) y la corriente nominal del interruptor general.',
    },
    {
      target: '#fases',
      title: 'Fases, empresa y año',
      body: 'Número de fases del tablero, empresa desarrolladora y año de instalación en 4 dígitos. Deben coincidir con el proyecto.',
    },
    {
      target: '#ip',
      title: 'Grado IP y ambiente',
      body: 'IP54 para interiores industriales, IP65 si hay polvo o chorros de agua. Usa «Tipo de ambiente» solo si es salino o corrosivo.',
    },
    {
      target: '#labelWidth',
      title: 'Ancho del rótulo',
      body: 'Ancho de impresión en mm. Entre 50 y 90 mm cubre la mayoría de tableros; ajusta según el espacio disponible.',
    },
    {
      target: 'button[type="submit"]',
      title: 'Genera e imprime',
      body: 'Pulsa «Generar Rótulo» para ver la vista previa y luego imprime o descarga el PNG para pegarlo en el tablero.',
    },
  ],
} as const satisfies Record<string, readonly TourStep[]>;

export type CalculatorGuideId = keyof typeof CALCULATOR_GUIDES;

/**
 * Último consejo que aparece **después de calcular**: señala el botón
 * «Copiar resultado» (vista previa + copiado) o el panel de resultados.
 * Solo existe para las calculadoras que ofrecen ese botón.
 */
export const CALCULATOR_RESULT_STEPS: Partial<
  Record<CalculatorGuideId, TourStep>
> = {
  seccion: {
    target: '[data-tour="copiar-resultado"]',
    title: 'Copia y comparte el resultado',
    body: 'Pulsa «Copiar resultado»: se abre una vista previa con el texto ya formateado para revisarlo antes de pegarlo en WhatsApp, un correo o tu informe.',
  },
  'caida-tension': {
    target: '[data-tour="copiar-resultado"]',
    title: 'Copia la caída de tensión',
    body: 'El botón «Copiar resultado» abre una vista previa con la caída en volts y %, la sección y la longitud máxima, lista para pegar en tu informe.',
  },
  corriente: {
    target: '[data-tour="copiar-resultado"]',
    title: 'Copia corriente y potencia',
    body: 'Con «Copiar resultado» verás el texto final (corriente, potencia y fórmula) antes de copiarlo a WhatsApp, un correo o tu memoria de cálculo.',
  },
  'seccion-ric': {
    target: '[data-tour="copiar-resultado"]',
    title: 'Copia el cálculo RIC',
    body: 'Abre «Copiar resultado» para revisar la sección, el equivalente AWG y la tabla RIC N°4 antes de pegar el resumen en tu informe.',
  },
};
