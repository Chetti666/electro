export interface SavedReportSummary {
  id: number;
  type: string;
  title: string;
  clientName: string | null;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedReportDetail extends SavedReportSummary {
  data: unknown;
}

export interface ReportSavePayload {
  type: string;
  title: string;
  clientName?: string;
  reference?: string;
  data: Record<string, unknown>;
}

function authErrorMessage(status: number): string {
  if (status === 401) {
    return 'Inicia sesión para guardar informes en tu panel.';
  }
  return 'No se pudo guardar el informe.';
}

export async function fetchSavedReport(
  reportId: number | string
): Promise<SavedReportDetail> {
  const response = await fetch(`/api/reports/${reportId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Inicia sesión para abrir informes guardados.');
    }
    if (response.status === 404) {
      throw new Error('El informe guardado no existe o no tienes acceso.');
    }
    throw new Error('No se pudo cargar el informe guardado.');
  }

  return response.json();
}

export async function persistSavedReport(
  payload: ReportSavePayload,
  reportId?: number | null
): Promise<SavedReportSummary> {
  const response = await fetch(
    reportId ? `/api/reports/${reportId}` : '/api/reports',
    {
      method: reportId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(authErrorMessage(response.status));
    }
    throw new Error(data.error || authErrorMessage(response.status));
  }

  return data as SavedReportSummary;
}
