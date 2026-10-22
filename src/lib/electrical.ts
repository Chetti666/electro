/**
 * Fórmulas compartidas por las calculadoras eléctricas.
 *
 * Se mantienen los mismos supuestos que usaban las páginas originales:
 * resistividad del cobre 0.018 Ω·mm²/m y tensiones nominales 220 V / 380 V.
 */

export type ElectricalSystem = 'monofasico' | 'trifasico';

export const COPPER_RESISTIVITY = 0.018;

export const NOMINAL_VOLTAGE: Record<ElectricalSystem, number> = {
  monofasico: 220,
  trifasico: 380,
};

/** Límite normativo usado por las calculadoras: 3 % de la tensión nominal. */
export const MAX_VOLTAGE_DROP_RATIO = 0.03;

/** Secciones comerciales de conductor (mm²). */
export const COMMERCIAL_SECTIONS = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300,
] as const;

export interface AwgSection {
  /** Etiqueta comercial, por ejemplo "12" o "2/0". */
  label: string;
  /** Área aproximada en mm². */
  mm2: number;
}

/**
 * Secciones AWG/kcmil con su área aproximada en mm².
 * Se usan como referencia comercial; la norma chilena trabaja en mm².
 */
export const AWG_SECTIONS: readonly AwgSection[] = [
  { label: '18', mm2: 0.823 },
  { label: '16', mm2: 1.31 },
  { label: '14', mm2: 2.08 },
  { label: '12', mm2: 3.31 },
  { label: '10', mm2: 5.26 },
  { label: '8', mm2: 8.37 },
  { label: '6', mm2: 13.3 },
  { label: '4', mm2: 21.2 },
  { label: '3', mm2: 26.7 },
  { label: '2', mm2: 33.6 },
  { label: '1', mm2: 42.4 },
  { label: '1/0', mm2: 53.5 },
  { label: '2/0', mm2: 67.4 },
  { label: '3/0', mm2: 85.0 },
  { label: '4/0', mm2: 107 },
  { label: '250 kcmil', mm2: 127 },
  { label: '300 kcmil', mm2: 152 },
  { label: '350 kcmil', mm2: 177 },
  { label: '400 kcmil', mm2: 203 },
  { label: '500 kcmil', mm2: 253 },
  { label: '600 kcmil', mm2: 304 },
  { label: '750 kcmil', mm2: 380 },
  { label: '1000 kcmil', mm2: 507 },
] as const;

/** Subconjunto de AWG usado como atajos en las calculadoras. */
const AWG_PRESET_LABELS = ['14', '12', '10', '8', '6', '4', '2', '1/0'];

export const AWG_PRESETS: readonly AwgSection[] = AWG_SECTIONS.filter((awg) =>
  AWG_PRESET_LABELS.includes(awg.label)
);

/** AWG más pequeño cuya área es mayor o igual a la sección indicada. */
export function minimumAwgForSection(
  sectionMm2: number
): AwgSection | null {
  if (!Number.isFinite(sectionMm2) || sectionMm2 <= 0) return null;
  return AWG_SECTIONS.find((awg) => awg.mm2 >= sectionMm2 - 1e-9) ?? null;
}

/** AWG cuya área coincide con el valor dado dentro de la tolerancia. */
export function awgForArea(
  sectionMm2: number,
  tolerance = 0.02
): AwgSection | null {
  if (!Number.isFinite(sectionMm2) || sectionMm2 <= 0) return null;
  return (
    AWG_SECTIONS.find(
      (awg) => Math.abs(awg.mm2 - sectionMm2) <= tolerance
    ) ?? null
  );
}

/** Etiqueta lista para mostrar: "12 AWG" o "250 kcmil". */
export function formatAwg(awg: AwgSection): string {
  return awg.label.includes('kcmil') ? awg.label : `${awg.label} AWG`;
}

export function isElectricalSystem(value: unknown): value is ElectricalSystem {
  return value === 'monofasico' || value === 'trifasico';
}

/** 2 para monofásico, √3 para trifásico. */
export function phaseFactor(system: ElectricalSystem): number {
  return system === 'monofasico' ? 2 : Math.sqrt(3);
}

export function nominalVoltage(system: ElectricalSystem): number {
  return NOMINAL_VOLTAGE[system];
}

export function voltageDropLimit(system: ElectricalSystem): number {
  return nominalVoltage(system) * MAX_VOLTAGE_DROP_RATIO;
}

/** Sección mínima (mm²) para no superar una caída de tensión dada. */
export function requiredSection({
  system,
  lengthM,
  currentA,
  maxDropV,
}: {
  system: ElectricalSystem;
  lengthM: number;
  currentA: number;
  maxDropV: number;
}): number {
  if (lengthM <= 0 || currentA <= 0 || maxDropV <= 0) return NaN;
  return (
    (phaseFactor(system) * COPPER_RESISTIVITY * lengthM * currentA) / maxDropV
  );
}

/** Primera sección comercial mayor o igual al valor calculado. */
export function nextCommercialSection(sectionMm2: number): number | null {
  if (!Number.isFinite(sectionMm2) || sectionMm2 <= 0) return null;
  return (
    COMMERCIAL_SECTIONS.find((section) => section >= sectionMm2 - 1e-9) ?? null
  );
}

/** Caída de tensión (V) en un conductor ya dimensionado. */
export function voltageDrop({
  system,
  sectionMm2,
  lengthM,
  currentA,
}: {
  system: ElectricalSystem;
  sectionMm2: number;
  lengthM: number;
  currentA: number;
}): number {
  if (sectionMm2 <= 0) return NaN;
  return (
    (phaseFactor(system) * COPPER_RESISTIVITY * lengthM * currentA) / sectionMm2
  );
}

/** Caída de tensión expresada como % de la tensión nominal del sistema. */
export function voltageDropPercent(
  system: ElectricalSystem,
  dropV: number
): number {
  return (dropV / nominalVoltage(system)) * 100;
}

/** Longitud máxima (m) que mantiene la caída de tensión dentro del límite. */
export function maxLengthForDrop({
  system,
  sectionMm2,
  currentA,
  maxDropV,
}: {
  system: ElectricalSystem;
  sectionMm2: number;
  currentA: number;
  maxDropV: number;
}): number {
  const factor = phaseFactor(system) * COPPER_RESISTIVITY * currentA;
  if (sectionMm2 <= 0 || currentA <= 0 || maxDropV <= 0 || factor <= 0) {
    return NaN;
  }
  return (maxDropV * sectionMm2) / factor;
}

/** Corriente (A) a partir de la potencia activa (W). */
export function currentFromPower({
  system,
  powerW,
  voltageV,
  powerFactor,
}: {
  system: ElectricalSystem;
  powerW: number;
  voltageV: number;
  powerFactor: number;
}): number {
  const systemFactor = system === 'monofasico' ? 1 : Math.sqrt(3);
  const denominator = voltageV * systemFactor * powerFactor;
  if (denominator <= 0) return NaN;
  return powerW / denominator;
}

/** Potencia activa (W) a partir de la corriente (A). */
export function powerFromCurrent({
  system,
  currentA,
  voltageV,
  powerFactor,
}: {
  system: ElectricalSystem;
  currentA: number;
  voltageV: number;
  powerFactor: number;
}): number {
  if (currentA <= 0 || voltageV <= 0 || powerFactor <= 0) return NaN;
  return system === 'monofasico'
    ? currentA * voltageV * powerFactor
    : currentA * voltageV * Math.sqrt(3) * powerFactor;
}

/** Potencia aparente (VA) a partir de la potencia activa y el factor de potencia. */
export function apparentPower(powerW: number, powerFactor: number): number {
  if (powerFactor <= 0) return NaN;
  return powerW / powerFactor;
}
