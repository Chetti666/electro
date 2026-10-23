export interface CopySection {
  heading?: string;
  lines: string[];
}

/**
 * Antepone la referencia del cálculo al título del texto copiado.
 * Si no hay referencia, devuelve el título original.
 */
export function withReference(title: string, reference?: string): string {
  const clean = reference?.trim();
  return clean ? `${title} · ${clean}` : title;
}

export interface CopyBlock {
  title: string;
  sections: CopySection[];
  footer?: string;
}

/**
 * Compone un texto plano legible para pegar en WhatsApp, notas o correo:
 * título, bloques con encabezado y separación por líneas en blanco.
 */
export function formatResultCopy({
  title,
  sections,
  footer = 'Calculado con VMElectric',
}: CopyBlock): string {
  const blocks: string[] = [title];

  for (const section of sections) {
    if (section.lines.length === 0) continue;
    const body = section.lines.join('\n');
    blocks.push(section.heading ? `${section.heading}\n${body}` : body);
  }

  if (footer) blocks.push(footer);

  return blocks.join('\n\n');
}
