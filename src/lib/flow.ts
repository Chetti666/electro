import crypto from 'node:crypto';

type FlowEnvironment = 'sandbox' | 'production';

const FLOW_API_URLS: Record<FlowEnvironment, string> = {
  sandbox: 'https://sandbox.flow.cl/api',
  production: 'https://www.flow.cl/api',
};

const FLOW_TIMEOUT_MS = 10_000;

interface FlowConfig {
  apiKey: string;
  secretKey: string;
  apiUrl: string;
}

function getFlowConfig(): FlowConfig {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error(
      'Flow no está configurado: define FLOW_API_KEY y FLOW_SECRET_KEY.'
    );
  }

  const environment: FlowEnvironment =
    process.env.FLOW_ENV === 'production' ? 'production' : 'sandbox';

  return { apiKey, secretKey, apiUrl: FLOW_API_URLS[environment] };
}

/**
 * Flow signs every request with HMAC-SHA256 over the alphabetically sorted
 * `key + value` concatenation (without separators).
 */
function signParams(
  params: Record<string, string>,
  secretKey: string
): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');

  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

function signRequest(
  params: Record<string, string | number | undefined>
): URLSearchParams {
  const { secretKey } = getFlowConfig();

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      normalized[key] = String(value);
    }
  }

  return new URLSearchParams({
    ...normalized,
    s: signParams(normalized, secretKey),
  });
}

async function readFlowResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? JSON.stringify((data as { error: unknown }).error)
        : `HTTP ${response.status}`;
    throw new Error(`Flow respondió con error: ${message}`);
  }

  if (typeof data === 'object' && data !== null && 'error' in data) {
    throw new Error(
      `Flow respondió con error: ${JSON.stringify((data as { error: unknown }).error)}`
    );
  }

  return data as T;
}

export interface FlowCreatePaymentInput {
  commerceOrder: string;
  subject: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
  optional?: string;
}

export interface FlowCreatePaymentResponse {
  url: string;
  token: string;
  flowOrder: number;
}

export async function createFlowPayment(
  input: FlowCreatePaymentInput
): Promise<FlowCreatePaymentResponse> {
  const { apiKey, apiUrl } = getFlowConfig();

  const body = signRequest({
    apiKey,
    commerceOrder: input.commerceOrder,
    subject: input.subject,
    currency: 'CLP',
    amount: input.amount,
    email: input.email,
    urlConfirmation: input.urlConfirmation,
    urlReturn: input.urlReturn,
    optional: input.optional,
  });

  const response = await fetch(`${apiUrl}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(FLOW_TIMEOUT_MS),
  });

  const payment = await readFlowResponse<FlowCreatePaymentResponse>(response);

  if (!payment?.url || !payment?.token) {
    throw new Error('Flow no devolvió la URL y el token del checkout.');
  }

  return payment;
}

export interface FlowPaymentStatus {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: 1 | 2 | 3 | 4;
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  optional?: unknown;
  pending_info?: Record<string, unknown>;
  paymentData?: Record<string, unknown>;
}

export async function getFlowPaymentStatus(
  token: string
): Promise<FlowPaymentStatus> {
  const { apiKey, apiUrl } = getFlowConfig();
  const query = signRequest({ apiKey, token });

  const response = await fetch(
    `${apiUrl}/payment/getStatus?${query.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(FLOW_TIMEOUT_MS),
    }
  );

  return readFlowResponse<FlowPaymentStatus>(response);
}
