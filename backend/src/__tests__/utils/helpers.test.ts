import { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  AppError,
  asyncHandler,
  detectDevice,
  errorHandler,
  getPagination,
  param,
  slugify,
  successResponse,
} from '../../utils/helpers';

function mockRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json };
}

describe('helpers utils', () => {
  it('builds success response', () => {
    const res = mockRes() as unknown as Response;
    successResponse(res, { ok: true }, 201);
    expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(201);
  });

  it('returns first value for array param', () => {
    expect(param(['a', 'b'])).toBe('a');
    expect(param('x')).toBe('x');
    expect(param(undefined)).toBe('');
  });

  it('slugifies text safely', () => {
    expect(slugify(' DN Tech 2026! ')).toBe('dn-tech-2026');
    expect(slugify('A---B__C')).toBe('a-b-c');
  });

  it('calculates pagination bounds', () => {
    expect(getPagination({ page: '2', pageSize: '10' })).toEqual({ page: 2, pageSize: 10, skip: 10 });
    expect(getPagination({ page: '-1', pageSize: '1000' })).toEqual({ page: 1, pageSize: 100, skip: 0 });
  });

  it('detects device from user agent', () => {
    expect(detectDevice()).toBe('desktop');
    expect(detectDevice('Mozilla iPhone')).toBe('mobile');
    expect(detectDevice('Mozilla iPad Tablet')).toBe('tablet');
    expect(detectDevice('Mozilla Desktop')).toBe('desktop');
  });

  it('maps AppError to HTTP response', () => {
    const res = mockRes() as unknown as Response;
    const err = new AppError(403, 'FORBIDDEN', 'Nope');
    errorHandler(err, {} as Request, res, (() => undefined) as NextFunction);
    expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(403);
  });

  it('maps ZodError to validation response', () => {
    const res = mockRes() as unknown as Response;
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: 'invalid' });
    if (parsed.success) throw new Error('Expected parse to fail');
    errorHandler(parsed.error, {} as Request, res, (() => undefined) as NextFunction);
    expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(400);
  });

  it('handles unhandled errors as 500', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = mockRes() as unknown as Response;
    errorHandler(new Error('boom'), {} as Request, res, (() => undefined) as NextFunction);
    expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(500);
    spy.mockRestore();
  });

  it('asyncHandler forwards rejection to next()', async () => {
    const next = jest.fn();
    const handler = asyncHandler(async () => {
      throw new Error('fail');
    });
    handler({} as Request, {} as Response, next as NextFunction);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(next).toHaveBeenCalled();
  });

  it('handles Prisma known request errors by fallback path', () => {
    const res = mockRes() as unknown as Response;
    const err = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });
    errorHandler(err, {} as Request, res, (() => undefined) as NextFunction);
    expect((res as unknown as { status: jest.Mock }).status).toHaveBeenCalledWith(409);
  });
});
