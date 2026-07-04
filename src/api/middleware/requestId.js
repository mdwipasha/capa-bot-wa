import { randomUUID } from 'crypto';

/**
 * requestId middleware — attach a unique X-Request-ID to every request/response.
 */
export function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  req.requestId = id;
  res.locals.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}
