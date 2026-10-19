function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  return '';
}

function labelSystem(value: unknown): string {
  if (value === 'monofasico' || value === 'monofasica') return 'Monofásico';
  if (value === 'trifasico' || value === 'trifasica') return 'Trifásico';
  return text(value);
}

export interface CalculationSummary {
  inputs: string;
  result: string;
}

export function formatCalculationSummary(
  type: string,
  input: unknown,
  result: unknown
): CalculationSummary {
  const i = asRecord(input);
  const r = asRecord(result);

  switch (type) {
    case 'SECCION':
      return {
        inputs: `L: ${text(i.longitud)} m · I: ${text(i.corriente)} A · Vp: ${text(i.caidaTension)} V · ${labelSystem(i.tipoSistema)}`,
        result: `${Number(r.seccion ?? 0).toFixed(2)} mm²`,
      };

    case 'CAIDA_TENSION':
      return {
        inputs: `S: ${text(i.seccion)} mm² · L: ${text(i.longitudMaxima)} m · I: ${text(i.corriente)} A · ${labelSystem(i.tipoSistema)}`,
        result: `${Number(r.caidaTension ?? 0).toFixed(2)} V${
          r.cumple === true ? ' · Cumple 3%' : ' · Supera 3%'
        }`,
      };

    case 'CORRIENTE_POTENCIA': {
      const objective =
        i.calculoObjetivo === 'potencia' ? 'Potencia' : 'Corriente';
      return {
        inputs: `${objective} · ${labelSystem(i.tipoSistema)} · P: ${text(i.potencia)} W · V: ${text(i.voltaje)} V · I: ${text(i.corriente)} A · FP: ${text(i.cosPhi)}`,
        result: `${Number(r.valor ?? 0).toFixed(2)} ${text(r.unidad)}`,
      };
    }

    case 'EMPALME': {
      const empalme = asRecord(r.empalme ?? r);
      const parts = [
        empalme.tipo_empalme ? `Tipo ${text(empalme.tipo_empalme)}` : '',
        empalme.interruptor_termomagnetico_A
          ? `${text(empalme.interruptor_termomagnetico_A)} A`
          : '',
        empalme.pot_nominal_kw
          ? `${text(empalme.pot_nominal_kw)} kW`
          : '',
      ].filter(Boolean);
      return {
        inputs: `${labelSystem(i.tipoInstalacion)} · ${
          i.metodoCalculo === 'corriente' ? 'Corriente' : 'Potencia'
        }: ${text(i.valorBuscado)}`,
        result: parts.length > 0 ? parts.join(' · ') : 'Empalme encontrado',
      };
    }

    case 'SECCION_RIC':
      return {
        inputs: `${text(i.conductor)} · I: ${text(i.corriente)} A · Método ${text(i.metodo)}`,
        result: `${Number(r.seccion ?? 0)} mm²${
          r.equivalente ? ` ${text(r.equivalente)}` : ''
        }`,
      };

    default:
      return {
        inputs: 'Cálculo registrado',
        result: 'Ver detalle',
      };
  }
}
