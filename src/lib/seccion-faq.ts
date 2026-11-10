export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Preguntas frecuentes de la calculadora de sección de conductores.
 * Se comparten entre el contenido visible y el JSON-LD (FAQPage) para que
 * ambos coincidan, tal como exige Google para datos estructurados.
 */
export const SECCION_FAQS: FaqItem[] = [
  {
    question: '¿Cómo se calcula la sección de un conductor?',
    answer:
      'Por caída de tensión se usa S = (2 × ρ × L × I) / Vp en monofásico y S = (√3 × ρ × L × I) / Vp en trifásico. ρ es la resistividad del cobre (0,018 Ω·mm²/m), L la longitud en metros, I la corriente en amperes y Vp la caída de tensión admisible en voltios. El resultado se expresa en mm² y luego se elige la sección comercial inmediatamente superior.',
  },
  {
    question: '¿Qué sección de cable necesito para 20 A?',
    answer:
      'Depende de la longitud y de la caída de tensión admitida. En monofásico de 220 V con 30 m, 20 A y un límite del 3 % (6,6 V), el cálculo da 3,27 mm², por lo que corresponde una sección comercial de 4 mm². A mayor distancia o menor caída permitida, la sección necesaria aumenta. Además debes verificar la corriente admisible del conductor.',
  },
  {
    question: '¿Qué diferencia hay entre mm² y AWG?',
    answer:
      'El mm² mide directamente el área de la sección del cobre y es la unidad que usa la normativa chilena y peruana. El AWG (American Wire Gauge) es una escala estadounidense en la que un número menor indica un conductor más grueso: 12 AWG equivale a 3,31 mm² y 10 AWG a 5,26 mm². La calculadora entrega ambos valores para que puedas comprar el cable con cualquiera de las dos nomenclaturas.',
  },
  {
    question: '¿La sección por caída de tensión garantiza que el cable soporte la corriente?',
    answer:
      'No. Son dos criterios independientes: la caída de tensión limita la pérdida de voltaje y la corriente admisible limita el calentamiento del conductor. Debes calcular ambos y adoptar la sección mayor. La capacidad de corriente se consulta en las tablas de la norma correspondiente (RIC N°4 en Chile, NOM-001-SEDE en México, CNE-Utilización en Perú).',
  },
  {
    question: '¿Sirve para instalaciones de México, Perú y otros países?',
    answer:
      'Sí. La fórmula de sección por caída de tensión es universal y solo depende de la resistividad, la longitud, la corriente y la caída de tensión admisible. Lo que cambia entre países es la tensión nominal y el porcentaje normativo, así que ajusta la tensión y el valor de Vp a tu instalación: 127 V o 220 V en México, 220 V en Perú y Chile, 240 V en otros países.',
  },
  {
    question: '¿Qué hago si el resultado no coincide con una sección comercial?',
    answer:
      'Siempre se elige la sección comercial inmediatamente superior al valor calculado, porque una sección menor no cumple la caída de tensión exigida. La calculadora muestra la sección mínima calculada, la sección comercial recomendada y el calibre AWG equivalente para que no tengas que buscar la tabla.',
  },
];
