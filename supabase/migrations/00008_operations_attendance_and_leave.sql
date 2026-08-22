-- Migration 00008: Operations — Attendance and Leave Modules
-- Purpose: Schema, composite foreign keys, indexes, and RLS policies for Attendance & Leave.

-- ============================================================================
-- 1. ATTENDANCE SCHEMA
-- ============================================================================

-- 1.1 Attendance Shifts
CREATE TABLE IF NOT EXISTS public.attendance_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  grace_period_minutes INTEGER NOT NULL DEFAULT 15,
  break_duration_minutes INTEGER NOT NULL DEFAULT 60,
  work_days TEXT[] NOT NULL DEFAULT ARRAY['MON','TUE','WED','THU','FRI']::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT uq_attendance_shifts_org_id UNIQUE (organization_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_shifts_org_code 
  ON public.attendance_shifts(organization_id, code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_shifts_org 
  ON public.attendance_shifts(organization_id) 
  WHERE deleted_at IS NULL;

-- 1.2 Biometric Devices
CREATE TABLE IF NOT EXISTS public.biometric_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL,
  device_name VARCHAR(150) NOT NULL,
  device_code VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ONLINE',
  last_heartbeat_at TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT uq_biometric_devices_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_biometric_devices_location FOREIGN KEY (organization_id, location_id)
    REFERENCES public.locations(organization_id, id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_biometric_devices_org_code 
  ON public.biometric_devices(organization_id, device_code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_biometric_devices_location 
  ON public.biometric_devices(organization_id, location_id) 
  WHERE deleted_at IS NULL;

-- 1.3 Attendance Records
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  shift_id UUID NULL,
  location_id UUID NULL,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ NULL,
  check_out TIMESTAMPTZ NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
  work_duration_minutes INTEGER NULL,
  is_regularized BOOLEAN NOT NULL DEFAULT false,
  regularization_reason TEXT NULL,
  regularized_by UUID NULL,
  regularized_at TIMESTAMPTZ NULL,
  check_in_latitude DECIMAL(10, 8) NULL,
  check_in_longitude DECIMAL(11, 8) NULL,
  check_out_latitude DECIMAL(10, 8) NULL,
  check_out_longitude DECIMAL(11, 8) NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_attendance_records_org_id UNIQUE (organization_id, id),
  CONSTRAINT uq_attendance_records_emp_date UNIQUE (organization_id, employee_id, date),
  CONSTRAINT fk_attendance_records_employee FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_records_shift FOREIGN KEY (organization_id, shift_id)
    REFERENCES public.attendance_shifts(organization_id, id) ON DELETE SET NULL,
  CONSTRAINT fk_attendance_records_location FOREIGN KEY (organization_id, location_id)
    REFERENCES public.locations(organization_id, id) ON DELETE SET NULL,
  CONSTRAINT fk_attendance_records_regularizer FOREIGN KEY (organization_id, regularized_by)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_org_emp 
  ON public.attendance_records(organization_id, employee_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_records_date 
  ON public.attendance_records(organization_id, date);

-- ============================================================================
-- 2. LEAVE SCHEMA
-- ============================================================================

-- 2.1 Holiday Calendars
CREATE TABLE IF NOT EXISTS public.holiday_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  location_id UUID NULL,
  name VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_holiday_calendars_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_holiday_calendars_location FOREIGN KEY (organization_id, location_id)
    REFERENCES public.locations(organization_id, id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_holiday_calendars_org_loc_date 
  ON public.holiday_calendars(organization_id, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'::uuid), date);

CREATE INDEX IF NOT EXISTS idx_holiday_calendars_year 
  ON public.holiday_calendars(organization_id, year);

-- 2.2 Leave Types
CREATE TABLE IF NOT EXISTS public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT NULL,
  days_allowed_per_year DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  is_carry_forward BOOLEAN NOT NULL DEFAULT false,
  max_carry_forward_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  is_paid BOOLEAN NOT NULL DEFAULT true,
  requires_attachment BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  CONSTRAINT uq_leave_types_org_id UNIQUE (organization_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leave_types_org_code 
  ON public.leave_types(organization_id, code) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leave_types_org 
  ON public.leave_types(organization_id) 
  WHERE deleted_at IS NULL;

-- 2.3 Leave Balances
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  leave_type_id UUID NOT NULL,
  year INTEGER NOT NULL,
  allocated_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  used_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  pending_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  carried_forward_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_leave_balances_org_id UNIQUE (organization_id, id),
  CONSTRAINT uq_leave_balances_emp_type_year UNIQUE (organization_id, employee_id, leave_type_id, year),
  CONSTRAINT fk_leave_balances_employee FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_balances_leave_type FOREIGN KEY (organization_id, leave_type_id)
    REFERENCES public.leave_types(organization_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_emp_year 
  ON public.leave_balances(organization_id, employee_id, year);

-- 2.4 Leave Requests
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  leave_type_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count DECIMAL(5, 2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  approver_id UUID NULL,
  approver_comments TEXT NULL,
  actioned_at TIMESTAMPTZ NULL,
  document_url TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_leave_requests_org_id UNIQUE (organization_id, id),
  CONSTRAINT fk_leave_requests_employee FOREIGN KEY (organization_id, employee_id)
    REFERENCES public.employees(organization_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_requests_leave_type FOREIGN KEY (organization_id, leave_type_id)
    REFERENCES public.leave_types(organization_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_leave_requests_approver FOREIGN KEY (organization_id, approver_id)
    REFERENCES public.employees(organization_id, id) ON DELETE SET NULL,
  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_leave_days_positive CHECK (days_count > 0)
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_emp 
  ON public.leave_requests(organization_id, employee_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_leave_requests_status 
  ON public.leave_requests(organization_id, status);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.attendance_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- 3.1 Attendance Shifts Policies
DROP POLICY IF EXISTS "attendance_shifts_select" ON public.attendance_shifts;
CREATE POLICY "attendance_shifts_select" ON public.attendance_shifts
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "attendance_shifts_write" ON public.attendance_shifts;
CREATE POLICY "attendance_shifts_write" ON public.attendance_shifts
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('attendance:admin')
  );

-- 3.2 Biometric Devices Policies
DROP POLICY IF EXISTS "biometric_devices_select" ON public.biometric_devices;
CREATE POLICY "biometric_devices_select" ON public.biometric_devices
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "biometric_devices_write" ON public.biometric_devices;
CREATE POLICY "biometric_devices_write" ON public.biometric_devices
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('attendance:admin')
  );

-- 3.3 Attendance Records Policies
DROP POLICY IF EXISTS "attendance_records_select" ON public.attendance_records;
CREATE POLICY "attendance_records_select" ON public.attendance_records
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_is_manager_of(employee_id)
      OR public.auth_has_permission('attendance:read:all')
      OR (public.auth_has_permission('attendance:read:team') AND public.auth_is_manager_of(employee_id))
    )
  );

DROP POLICY IF EXISTS "attendance_records_insert" ON public.attendance_records;
CREATE POLICY "attendance_records_insert" ON public.attendance_records
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_has_permission('attendance:admin')
    )
  );

DROP POLICY IF EXISTS "attendance_records_update" ON public.attendance_records;
CREATE POLICY "attendance_records_update" ON public.attendance_records
  FOR UPDATE USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_is_manager_of(employee_id)
      OR public.auth_has_permission('attendance:approve')
      OR public.auth_has_permission('attendance:admin')
    )
  );

-- 3.4 Holiday Calendars Policies
DROP POLICY IF EXISTS "holiday_calendars_select" ON public.holiday_calendars;
CREATE POLICY "holiday_calendars_select" ON public.holiday_calendars
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "holiday_calendars_write" ON public.holiday_calendars;
CREATE POLICY "holiday_calendars_write" ON public.holiday_calendars
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('leave:admin')
  );

-- 3.5 Leave Types Policies
DROP POLICY IF EXISTS "leave_types_select" ON public.leave_types;
CREATE POLICY "leave_types_select" ON public.leave_types
  FOR SELECT USING (organization_id = public.auth_org_id());

DROP POLICY IF EXISTS "leave_types_write" ON public.leave_types;
CREATE POLICY "leave_types_write" ON public.leave_types
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('leave:admin')
  );

-- 3.6 Leave Balances Policies
DROP POLICY IF EXISTS "leave_balances_select" ON public.leave_balances;
CREATE POLICY "leave_balances_select" ON public.leave_balances
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_is_manager_of(employee_id)
      OR public.auth_has_permission('leave:read:all')
    )
  );

DROP POLICY IF EXISTS "leave_balances_write" ON public.leave_balances;
CREATE POLICY "leave_balances_write" ON public.leave_balances
  FOR ALL USING (
    organization_id = public.auth_org_id()
    AND public.auth_has_permission('leave:admin')
  );

-- 3.7 Leave Requests Policies
DROP POLICY IF EXISTS "leave_requests_select" ON public.leave_requests;
CREATE POLICY "leave_requests_select" ON public.leave_requests
  FOR SELECT USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_is_manager_of(employee_id)
      OR public.auth_has_permission('leave:read:all')
    )
  );

DROP POLICY IF EXISTS "leave_requests_insert" ON public.leave_requests;
CREATE POLICY "leave_requests_insert" ON public.leave_requests
  FOR INSERT WITH CHECK (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_has_permission('leave:admin')
    )
  );

DROP POLICY IF EXISTS "leave_requests_update" ON public.leave_requests;
CREATE POLICY "leave_requests_update" ON public.leave_requests
  FOR UPDATE USING (
    organization_id = public.auth_org_id() AND (
      employee_id = public.auth_employee_id()
      OR public.auth_is_manager_of(employee_id)
      OR public.auth_has_permission('leave:approve')
      OR public.auth_has_permission('leave:admin')
    )
  );
