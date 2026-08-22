import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from './api-handler';
import { NotFoundError } from '@/core/errors/app-error';

// Mock Supabase Server Client and Auth Context
vi.mock('@/config/supabase-server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/core/auth/auth-context', () => ({
  buildAuthContext: vi.fn(),
}));

import { createSupabaseServerClient } from '@/config/supabase-server';
import { buildAuthContext } from '@/core/auth/auth-context';

import type { SupabaseClient } from '@supabase/supabase-js';

describe('createApiHandler', () => {
  const mockSupabase = {
    from: vi.fn(),
  };

  const defaultAuthContext = {
    userId: 'user-123',
    employeeId: 'emp-123',
    organizationId: 'org-123',
    roles: ['EMPLOYEE'],
    permissions: ['leave:apply:self', 'attendance:log:self'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient);
    vi.mocked(buildAuthContext).mockResolvedValue(defaultAuthContext);
  });

  it('successfully executes handler and formats standard JSON success envelope', async () => {
    const handler = createApiHandler({
      auth: true,
      handler: async ({ auth, traceId }) => {
        return {
          status: 200,
          data: { greeting: `Hello ${auth.userId}`, traceId },
        };
      },
    });

    const req = new NextRequest('http://localhost:3000/api/v1/test', {
      headers: { 'x-trace-id': 'custom-trace-id-123' },
    });

    const res = await handler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.greeting).toBe('Hello user-123');
    expect(json.data.traceId).toBe('custom-trace-id-123');
    expect(json.meta.traceId).toBe('custom-trace-id-123');
    expect(json.meta.timestamp).toBeDefined();
  });

  it('validates request body against Zod schema and handles validation errors', async () => {
    const schema = z.object({
      leaveTypeId: z.string().uuid(),
      days: z.number().positive(),
    });

    const handler = createApiHandler({
      auth: true,
      schema,
      handler: async ({ body }) => {
        return { status: 201, data: body };
      },
    });

    // Invalid body (missing days and invalid UUID)
    const invalidReq = new NextRequest('http://localhost:3000/api/v1/test', {
      method: 'POST',
      body: JSON.stringify({ leaveTypeId: 'not-a-uuid' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await handler(invalidReq);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_FAILED');
    expect(json.error.details).toHaveLength(2);
  });

  it('enforces RBAC permissions and rejects unauthorized users with 403 Forbidden', async () => {
    const handler = createApiHandler({
      auth: true,
      permissions: ['payroll:process'], // User does not have this permission
      handler: async () => {
        return { data: { secret: 'payroll-data' } };
      },
    });

    const req = new NextRequest('http://localhost:3000/api/v1/test');
    const res = await handler(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('handles unauthenticated requests with 401 Unauthorized', async () => {
    vi.mocked(buildAuthContext).mockRejectedValueOnce(new Error('No session'));

    const handler = createApiHandler({
      auth: true,
      handler: async () => {
        return { data: 'ok' };
      },
    });

    const req = new NextRequest('http://localhost:3000/api/v1/test');
    const res = await handler(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('maps AppError subclasses to appropriate HTTP status codes and error bodies', async () => {
    const handler = createApiHandler({
      auth: true,
      handler: async () => {
        throw new NotFoundError('LeaveRequest', 'req-999');
      },
    });

    const req = new NextRequest('http://localhost:3000/api/v1/test');
    const res = await handler(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
    expect(json.error.message).toContain("LeaveRequest with ID 'req-999' was not found");
  });

  it('supports paginated responses with pagination metadata', async () => {
    const handler = createApiHandler({
      auth: false,
      handler: async () => {
        return {
          data: [{ id: 1 }, { id: 2 }],
          pagination: {
            page: 1,
            limit: 10,
            totalItems: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
      },
    });

    const req = new NextRequest('http://localhost:3000/api/v1/test');
    const res = await handler(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.meta.pagination.totalItems).toBe(2);
  });
});
