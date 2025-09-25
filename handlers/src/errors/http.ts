// Lightweight HTTP error utilities for controllers/services
// Consider replacing with fastify-sensible or http-errors later.

export const HttpStatus = {
  BadRequest: 400,
  NotFound: 404,
  InternalServerError: 500,
  BadGatewayError: 502,
} as const;

export class NotFoundError extends Error {
  code = HttpStatus.NotFound;
}

export class BadRequestError extends Error {
  code = HttpStatus.BadRequest;
}

export class InternalServerError extends Error {
  code = HttpStatus.InternalServerError;
}

export class BadGatewayError extends Error {
  code = HttpStatus.BadGatewayError;
}
