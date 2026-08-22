import { z } from 'zod';

export const ApplyLeaveSchema = z.object({
  leaveTypeId: z.string().uuid('Valid leaveTypeId UUID required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
  daysCount: z.number().positive('daysCount must be greater than 0'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
  documentUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'endDate must be on or after startDate',
  path: ['endDate'],
});

export const ActionLeaveRequestSchema = z.object({
  requestId: z.string().uuid('Valid requestId UUID required'),
  action: z.enum(['APPROVE', 'REJECT']),
  comments: z.string().max(500).optional(),
});

export const CreateLeaveTypeSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/, 'Alphanumeric uppercase code required'),
  description: z.string().max(500).optional(),
  daysAllowedPerYear: z.number().min(0).max(365),
  isCarryForward: z.boolean().default(false),
  maxCarryForwardDays: z.number().min(0).max(365).default(0),
  isPaid: z.boolean().default(true),
  requiresAttachment: z.boolean().default(false),
});

export const AllocateLeaveBalanceSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  allocatedDays: z.number().min(0).max(365),
  carriedForwardDays: z.number().min(0).max(365).default(0),
});

export const CreateHolidaySchema = z.object({
  locationId: z.string().uuid().optional(),
  name: z.string().min(2).max(150),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required'),
  isOptional: z.boolean().default(false),
  description: z.string().max(500).optional(),
});

export const QueryLeaveSchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  year: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
