const FONNTE_API = 'https://api.fonnte.com/send';

type SendWAResult = { success: true } | { success: false; error: string };

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1);
  if (cleaned.startsWith('62')) return cleaned;
  return '62' + cleaned;
}

export async function sendWA(
  phone: string,
  message: string,
): Promise<SendWAResult> {
  const apiKey = process.env.FONNTE_API_KEY;
  if (!apiKey) return { success: false, error: 'FONNTE_API_KEY not set' };

  try {
    const body = new FormData();
    body.append('target', normalizePhone(phone));
    body.append('message', message);
    body.append('countryCode', '62');

    const res = await fetch(FONNTE_API, {
      method: 'POST',
      headers: { 'Authorization': apiKey },
      body,
    });

    const data = await res.json();
    if (!res.ok || data.status === false) {
      return { success: false, error: data.reason ?? data.message ?? 'Unknown error' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
