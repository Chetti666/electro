import type { jsPDF } from 'jspdf';

/** Logo azul pensado para documentos con fondo claro (PDF). */
export const PDF_LOGO_SRC = '/logo1.png';

let cachedLogo: Promise<string> | null = null;

/**
 * Carga el logo como data URL para poder incrustarlo con jsPDF.
 * El resultado se cachea para no volver a descargarlo en cada exportación.
 */
export function loadPdfLogo(): Promise<string> {
  if (!cachedLogo) {
    cachedLogo = fetch(PDF_LOGO_SRC)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`No se pudo cargar el logo (${response.status})`);
        }
        return response.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el logo'));
            reader.readAsDataURL(blob);
          })
      )
      .catch((error) => {
        cachedLogo = null;
        throw error;
      });
  }

  return cachedLogo;
}

interface PdfLogoOptions {
  /** Alto del logo en milímetros. El ancho se calcula con la proporción original. */
  height: number;
  /** Margen izquierdo/derecho de la página en milímetros. */
  margin: number;
  /** Posición vertical (borde superior) en milímetros. */
  y: number;
  align?: 'left' | 'center';
}

/** Dibuja el logo en el documento y devuelve la coordenada Y inferior. */
export function addPdfLogo(doc: jsPDF, logoDataUrl: string, options: PdfLogoOptions): number {
  const { height, margin, y, align = 'left' } = options;
  const { width, height: intrinsicHeight } = doc.getImageProperties(logoDataUrl);
  const logoWidth = (height / intrinsicHeight) * width;
  const pageWidth = doc.internal.pageSize.getWidth();
  const x = align === 'center' ? (pageWidth - logoWidth) / 2 : margin;

  doc.addImage(logoDataUrl, 'PNG', x, y, logoWidth, height);

  return y + height;
}

/**
 * Añade el logo al PDF sin interrumpir la generación del documento si el
 * recurso no se puede cargar.
 */
export async function tryAddPdfLogo(doc: jsPDF, options: PdfLogoOptions): Promise<void> {
  try {
    addPdfLogo(doc, await loadPdfLogo(), options);
  } catch (error) {
    console.warn('No se pudo añadir el logo al PDF:', error);
  }
}
