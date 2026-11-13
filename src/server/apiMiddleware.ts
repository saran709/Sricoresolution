import type { NextFunction, Request, Response } from 'express';
import zlib from 'zlib';

export interface RateLimitOptions {
  keyPrefix: string;
  windowMs: number;
  maxRequests: number;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

const MAX_RATE_BUCKETS = 10_000;
const rateBuckets = new Map<string, RateBucket>();

function pruneRateBuckets(now: number) {
  if (rateBuckets.size < MAX_RATE_BUCKETS) return;
  for (const [key, bucket] of rateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateBuckets.delete(key);
    }
    if (rateBuckets.size < MAX_RATE_BUCKETS * 0.8) break;
  }
  // Evict oldest keys if map is still near capacity
  while (rateBuckets.size >= MAX_RATE_BUCKETS) {
    const firstKey = rateBuckets.keys().next().value;
    if (!firstKey) break;
    rateBuckets.delete(firstKey);
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

export function applyApiSecurityHeaders(res: Response) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
}

export function checkRateLimit(
  req: Request,
  res: Response,
  options: RateLimitOptions
): boolean {
  const now = Date.now();
  pruneRateBuckets(now);

  const clientKey = `${options.keyPrefix}:${getClientIp(req)}`;
  const existing = rateBuckets.get(clientKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    rateBuckets.set(clientKey, { count: 1, resetAt });
    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.maxRequests - 1)));
    return true;
  }

  existing.count += 1;
  const remaining = Math.max(0, options.maxRequests - existing.count);
  res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
  res.setHeader('X-RateLimit-Remaining', String(remaining));

  if (existing.count > options.maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSec));
    res.status(429).json({
      error: 'Too many requests. Please slow down and try again shortly.',
      retryAfterSeconds: retryAfterSec,
    });
    return false;
  }

  return true;
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    applyApiSecurityHeaders(res);
    if (!checkRateLimit(req, res, options)) {
      return;
    }
    next();
  };
}

export function apiTimingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startNs = process.hrtime.bigint();
  const originalEnd = res.end.bind(res) as (...args: unknown[]) => Response;

  res.end = function (...args: unknown[]): Response {
    if (!res.headersSent) {
      const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;
      res.setHeader('X-Response-Time', `${elapsedMs.toFixed(1)}ms`);
    }
    return originalEnd(...args);
  } as Response['end'];

  next();
}

/**
 * Lightweight gzip compression middleware for JSON/text/JS/CSS/SVG responses (> 1 KB)
 * using Node's built-in zlib so no external runtime package is required.
 */
export function gzipCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  if (!acceptEncoding.includes('gzip') || req.method === 'HEAD') {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    try {
      const payload = JSON.stringify(body);
      const buffer = Buffer.from(payload, 'utf8');
      if (buffer.byteLength < 1024 || res.headersSent) {
        return originalJson(body);
      }
      const compressed = zlib.gzipSync(buffer, { level: zlib.constants.Z_BEST_SPEED });
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Length', String(compressed.byteLength));
      return res.send(compressed);
    } catch {
      return originalJson(body);
    }
  };

  next();
}

/**
 * Wrap any handler for Vercel Serverless entrypoints (/api/*) with consistent
 * HTTP method checks, security headers, and sliding-window rate limiting.
 */
export function withServerlessGuard(
  allowedMethods: Array<'GET' | 'POST'>,
  rateLimit: RateLimitOptions | null,
  handler: (req: Request, res: Response) => unknown | Promise<unknown>
) {
  return async (req: Request, res: Response) => {
    applyApiSecurityHeaders(res);

    const method = (req.method || 'GET').toUpperCase() as 'GET' | 'POST';
    if (method === 'OPTIONS' as string) {
      res.setHeader('Allow', allowedMethods.join(', '));
      return res.status(204).end();
    }

    if (!allowedMethods.includes(method)) {
      res.setHeader('Allow', allowedMethods.join(', '));
      return res.status(405).json({
        error: `Method ${method} not allowed. Expected ${allowedMethods.join(' or ')}.`,
      });
    }

    if (rateLimit && !checkRateLimit(req, res, rateLimit)) {
      return;
    }

    return handler(req, res);
  };
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
