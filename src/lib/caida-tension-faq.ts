export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Preguntas frecuentes de la calculadora de caída de tensión.
 * Se comparten entre el contenido visible y el JSON-LD (FAQPage) para que
 * ambos coincidan, tal como exige Google para datos estructurados.
 */
export const CAIDA_TENSION_FAQS: FaqItem[] = [
  {
    question: '¿Qué es la caída de tensión?',
    answer:
      'Es la diferencia entre la tensión que entrega la fuente y la que llega al equipo final. Se produce por la resistencia del conductor y aumenta con la longitud del tramo, la corriente y la sección del cable: a mayor distancia o consumo, mayor pérdida de voltaje.',
  },
  {
    question: '¿Cómo se calcula la caída de tensión?',
    answer:
      'En monofásico se usa ΔV = (2 × ρ × L × I) / S, y en trifásico ΔV = (√3 × ρ × L × I) / S. ρ es la resistividad del cobre (0,018 Ω·mm²/m), L la longitud en metros, I la corriente en amperes y S la sección del conductor en mm². El porcentaje se obtiene dividiendo ΔV por la tensión nominal y multiplicando por 100.',
  },
  {
    question: '¿Cuál es la caída de tensión máxima permitida?',
    answer:
      'Depende de la normativa de cada país y del tipo de circuito. Esta calculadora usa 3 % de la tensión nominal como referencia práctica; en Chile la RIC N°4, en México la NOM-001-SEDE y en Perú el CNE-Utilización establecen sus propios límites. Verifica siempre el valor exigido en tu instalación.',
  },
  {
    question: '¿Sirve para México, Perú y otros países de Latinoamérica?',
    answer:
      'Sí. La fórmula de caída de tensión es universal; solo cambian la tensión nominal y el límite normativo. Ajusta la tensión nominal a la de tu red (por ejemplo 127 V o 220 V en México, 220 V en Perú y Chile, o 240 V en otros países) y obtendrás el porcentaje correcto.',
  },
  {
    question: '¿Cuál es la diferencia entre caída de tensión monofásica y trifásica?',
    answer:
      'En un circuito monofásico la corriente recorre el conductor de ida y el de retorno, por eso la fórmula usa el factor 2. En trifásico se usa √3 porque la tensión es entre fases y la corriente se reparte entre tres conductores. Con la misma sección, longitud y corriente, la caída porcentual trifásica suele ser menor.',
  },
];
