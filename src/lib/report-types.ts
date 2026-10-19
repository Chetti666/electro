export const REPORT_TYPE_VALUES = [
  'PRESUPUESTO',
  'RESISTIVIDAD_SEV',
  'FOTOGRAFICO_RIC18',
  'INSPECCION',
] as const;

export type ReportTypeValue = (typeof REPORT_TYPE_VALUES)[number];

export const REPORT_TYPE_META: Record<
  string,
  { label: string; href: string; description: string }
> = {
  PRESUPUESTO: {
    label: 'Presupuesto',
    href: '/informes/presupuesto',
    description: 'Presupuestos con ítems, precios y condiciones comerciales.',
  },
  RESISTIVIDAD_SEV: {
    label: 'Resistividad SEV',
    href: '/informes/informe-resistividad',
    description: 'Sondeo eléctrico vertical y curva de resistividad.',
  },
  FOTOGRAFICO_RIC18: {
    label: 'Informe fotográfico RIC N°18',
    href: '/informes/informe-fotografico',
    description: 'Registro fotográfico normativo de la instalación.',
  },
  INSPECCION: {
    label: 'Informe de inspección',
    href: '/informes/informe-inspeccion',
    description: 'Levantamiento y checklist de inspección eléctrica.',
  },
};

export function isReportType(value: string): value is ReportTypeValue {
  return (REPORT_TYPE_VALUES as readonly string[]).includes(value);
}

export function getReportHref(type: string, reportId: number): string {
  const base = REPORT_TYPE_META[type]?.href ?? '/informes';
  return `${base}?reportId=${reportId}`;
}
