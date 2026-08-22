import { z } from 'zod';
import { AttendanceStatus } from './types';

export const CheckInSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CheckOutSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const RegularizeAttendanceSchema = z.object({
  recordId: z.string().uuid(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  status: z.enum([
    AttendanceStatus.PRESENT,
    AttendanceStatus.HALF_DAY,
    AttendanceStatus.ON_LEAVE,
    AttendanceStatus.ABSENT,
  ]).optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const CreateShiftSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/, 'Code must be alphanumeric with hyphens/underscores'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Format must be HH:MM or HH:MM:SS'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Format must be HH:MM or HH:MM:SS'),
  gracePeriodMinutes: z.number().int().min(0).max(120).default(15),
  breakDurationMinutes: z.number().int().min(0).max(240).default(60),
  workDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).default(['MON', 'TUE', 'WED', 'THU', 'FRI']),
});

export const QueryAttendanceSchema = z.object({
  employeeId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD required').optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
