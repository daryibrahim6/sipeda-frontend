import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type RateLimitResult = { allowed: boolean; retryAfter?: number };

let limiter: Ratelimit | null = null;
let redisHealthy = false;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(20, '60 s'),
    analytics: true,
    prefix: 'sipeda:rl',
  });
  return limiter;
}

const memMap = new Map<string, { count: number; resetAt: number }>();

function memCheck(
  ip: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = memMap.get(ip);
  if (!entry || now > entry.resetAt) {
    memMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  entry.count++;
  if (entry.count > max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function getIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

export async function checkRateLimit(
  req: Request,
  opts: { maxRequests: number; windowMs: number } = { maxRequests: 20, windowMs: 60_000 },
): Promise<RateLimitResult> {
  const ip = getIp(req);
  const rl = getLimiter();
  if (rl) {
    try {
      const r = await rl.limit(ip, { rate: opts.maxRequests });
      if (!r.success) {
        return { allowed: false, retryAfter: Math.ceil((r.reset - Date.now()) / 1000) };
      }
      redisHealthy = true;
      return { allowed: true };
    } catch (err) {
      console.error('[rate-limit] Upstash error, falling back to in-memory:', err);
      redisHealthy = false;
    }
  }
  return memCheck(ip, opts.maxRequests, opts.windowMs);
}

export function rateLimitMiddleware(
  opts?: { maxRequests?: number; windowMs?: number },
): (req: Request) => Promise<RateLimitResult> {
  const max = opts?.maxRequests ?? 20;
  const win = opts?.windowMs ?? 60_000;
  return async (req: Request) => checkRateLimit(req, { maxRequests: max, windowMs: win });
}

export function isUsingUpstash(): boolean {
  return getLimiter() !== null && redisHealthy;
}
