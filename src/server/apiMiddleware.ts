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

const COMPRESSIBLE_MIME_RE =
  /^(?:text\/(?!event-stream)|application\/(?:javascript|x-javascript|json|xml|wasm)|image\/svg\+xml)/i;

function appendVaryHeader(res: Response, value: string) {
  const existing = res.getHeader('vary');
  if (!existing) {
    res.setHeader('Vary', value);
    return;
  }
  const current = Array.isArray(existing) ? existing.join(', ') : String(existing);
  if (!current.toLowerCase().includes(value.toLowerCase())) {
    res.setHeader('Vary', `${current}, ${value}`);
  }
}

/**
 * Lightweight streaming gzip compression middleware for HTML/JS/CSS/SVG/JSON responses (> 1 KB)
 * using Node's built-in zlib so no external runtime package is required.
 */
export function gzipCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  if (!/\bgzip\b/i.test(acceptEncoding) || req.method === 'HEAD') {
    return next();
  }

  const origWrite = res.write.bind(res) as Response['write'];
  const origEnd = res.end.bind(res) as Response['end'];
  const origWriteHead = res.writeHead.bind(res) as Response['writeHead'];

  let decided = false;
  let gzipStream: zlib.Gzip | null = null;
  let endCallback: (() => void) | undefined;

  const decideCompression = (firstChunkByteLength = 0) => {
    if (decided) return;
    decided = true;

    if (res.headersSent) return;

    const status = res.statusCode;
    if (status < 200 || status >= 300 || status === 204 || status === 206 || status === 304) {
      return;
    }

    if (res.getHeader('content-encoding')) {
      return;
    }

    const contentType = String(res.getHeader('content-type') || '');
    if (!COMPRESSIBLE_MIME_RE.test(contentType)) {
      return;
    }

    const rawContentLength = res.getHeader('content-length');
    const numericLength =
      rawContentLength !== undefined ? Number(rawContentLength) : firstChunkByteLength;
    if (Number.isFinite(numericLength) && numericLength > 0 && numericLength < 1024) {
      return;
    }

    res.removeHeader('Content-Length');
    res.removeHeader('Accept-Ranges');

    const etag = res.getHeader('etag');
    if (typeof etag === 'string' && !etag.startsWith('W/')) {
      res.setHeader('ETag', `W/${etag}`);
    }

    res.setHeader('Content-Encoding', 'gzip');
    appendVaryHeader(res, 'Accept-Encoding');

    gzipStream = zlib.createGzip({ level: zlib.constants.Z_BEST_SPEED });

    gzipStream.on('data', (compressedChunk: Buffer) => {
      if (!origWrite(compressedChunk)) {
        gzipStream?.pause();
      }
    });

    res.on('drain', () => {
      gzipStream?.resume();
    });

    gzipStream.on('end', () => {
      const cb = endCallback;
      endCallback = undefined;
      if (cb) {
        origEnd(cb);
      } else {
        origEnd();
      }
    });

    gzipStream.on('error', () => {
      gzipStream = null;
      if (!res.writableEnded) {
        origEnd();
      }
    });
  };

  res.writeHead = function (
    statusCode: number,
    statusMessageOrHeaders?: unknown,
    maybeHeaders?: unknown
  ): Response {
    res.statusCode = statusCode;
    const headersObj =
      typeof statusMessageOrHeaders === 'object' && statusMessageOrHeaders !== null
        ? (statusMessageOrHeaders as Record<string, string | string[] | number>)
        : typeof maybeHeaders === 'object' && maybeHeaders !== null
          ? (maybeHeaders as Record<string, string | string[] | number>)
          : undefined;

    if (headersObj) {
      for (const [key, val] of Object.entries(headersObj)) {
        res.setHeader(key, val as string);
      }
    }

    decideCompression();

    if (typeof statusMessageOrHeaders === 'string') {
      return origWriteHead(statusCode, statusMessageOrHeaders);
    }
    return origWriteHead(statusCode);
  } as Response['writeHead'];

  res.write = function (
    chunk: unknown,
    encodingOrCb?: unknown,
    maybeCb?: unknown
  ): boolean {
    const encoding = typeof encodingOrCb === 'string' ? (encodingOrCb as BufferEncoding) : undefined;
    const cb =
      typeof encodingOrCb === 'function'
        ? (encodingOrCb as (error?: Error | null) => void)
        : typeof maybeCb === 'function'
          ? (maybeCb as (error?: Error | null) => void)
          : undefined;

    const byteLength = chunk
      ? Buffer.isBuffer(chunk)
        ? chunk.byteLength
        : Buffer.byteLength(String(chunk), encoding)
      : 0;

    decideCompression(byteLength);

    if (gzipStream) {
      if (encoding) {
        return gzipStream.write(chunk, encoding, cb);
      }
      return gzipStream.write(chunk, cb);
    }

    if (encoding) {
      return origWrite(chunk, encoding, cb);
    }
    return origWrite(chunk, cb);
  } as Response['write'];

  res.end = function (
    chunkOrCb?: unknown,
    encodingOrCb?: unknown,
    maybeCb?: unknown
  ): Response {
    let chunk: unknown = undefined;
    let encoding: BufferEncoding | undefined;
    let cb: (() => void) | undefined;

    if (typeof chunkOrCb === 'function') {
      cb = chunkOrCb as () => void;
    } else {
      chunk = chunkOrCb;
      if (typeof encodingOrCb === 'function') {
        cb = encodingOrCb as () => void;
      } else if (typeof encodingOrCb === 'string') {
        encoding = encodingOrCb as BufferEncoding;
        if (typeof maybeCb === 'function') {
          cb = maybeCb as () => void;
        }
      }
    }

    const hasChunk = chunk !== undefined && chunk !== null;
    const byteLength = hasChunk
      ? Buffer.isBuffer(chunk)
        ? chunk.byteLength
        : Buffer.byteLength(String(chunk), encoding)
      : 0;

    decideCompression(byteLength);

    if (gzipStream) {
      endCallback = cb;
      if (hasChunk) {
        if (encoding) {
          gzipStream.write(chunk, encoding);
        } else {
          gzipStream.write(chunk);
        }
      }
      gzipStream.end();
      return res;
    }

    if (hasChunk) {
      if (encoding) {
        return origEnd(chunk, encoding, cb);
      }
      return origEnd(chunk, cb);
    }
    return origEnd(cb);
  } as Response['end'];

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
