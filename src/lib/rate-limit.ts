const ipMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  opts: { maxRequests: number; windowMs: number } = { maxRequests: 20, windowMs: 60_000 },
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > opts.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

export function rateLimitMiddleware(
  opts?: { maxRequests?: number; windowMs?: number },
): (req: Request) => { allowed: boolean; retryAfter?: number } {
  const maxRequests = opts?.maxRequests ?? 20;
  const windowMs = opts?.windowMs ?? 60_000;
  return (req: Request) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';
    return checkRateLimit(ip, { maxRequests, windowMs });
  };
}
