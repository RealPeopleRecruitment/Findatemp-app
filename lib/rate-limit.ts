import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const registerLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '10 m'), prefix: 'rl:register' })
  : null;

const requestLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '10 m'), prefix: 'rl:request' })
  : null;

const confirmLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10 m'), prefix: 'rl:confirm' })
  : null;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

async function check(limiter: Ratelimit | null, identifier: string): Promise<boolean> {
  if (!limiter) {
    console.warn('Rate limiting not configured (missing Upstash env vars) — allowing request through.');
    return true;
  }
  try {
    const { success } = await limiter.limit(identifier);
    return success;
  } catch (err) {
    console.error('Rate limit check failed, allowing request through:', err);
    return true;
  }
}

export async function checkRegisterRateLimit(req: Request): Promise<boolean> {
  return check(registerLimiter, getClientIp(req));
}

export async function checkRequestRateLimit(req: Request): Promise<boolean> {
  return check(requestLimiter, getClientIp(req));
}

export async function checkConfirmRateLimit(req: Request): Promise<boolean> {
  return check(confirmLimiter, getClientIp(req));
}
