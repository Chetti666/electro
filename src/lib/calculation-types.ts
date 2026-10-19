export const CALCULATION_TYPE_VALUES = [
  'SECCION',
  'CAIDA_TENSION',
  'CORRIENTE_POTENCIA',
  'EMPALME',
  'SECCION_RIC',
] as const;

export type CalculationTypeValue = (typeof CALCULATION_TYPE_VALUES)[number];

export const CALCULATION_LABELS: Record<string, string> = {
  SECCION: 'Sección de conductores',
  CAIDA_TENSION: 'Caída de tensión',
  CORRIENTE_POTENCIA: 'Corriente y potencia',
  EMPALME: 'Empalme eléctrico',
  SECCION_RIC: 'Sección RIC N°4',
};

export const CALCULATION_HREFS: Record<string, string> = {
  SECCION: '/calculadoras/seccion',
  CAIDA_TENSION: '/calculadoras/caida-tension',
  CORRIENTE_POTENCIA: '/calculadoras/calculadora-corriente',
  EMPALME: '/calculadoras/empalmes',
  SECCION_RIC: '/calculadoras/seccion-ric',
};

export function isCalculationType(value: string): value is CalculationTypeValue {
  return (CALCULATION_TYPE_VALUES as readonly string[]).includes(value);
}
