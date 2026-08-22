-- Migration 00001: Foundation Extensions and Custom Enums
-- Purpose: Initialize PostgreSQL extensions and custom domain enum types.

-- 1. Enable Core PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Domain Enums
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type') THEN
    CREATE TYPE public.employment_type AS ENUM (
      'FULL_TIME', 
      'PART_TIME', 
      'CONTRACTOR', 
      'INTERN'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_status') THEN
    CREATE TYPE public.employment_status AS ENUM (
      'ACTIVE', 
      'PROBATION', 
      'NOTICE_PERIOD', 
      'ON_LEAVE', 
      'SUSPENDED', 
      'TERMINATED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE public.gender_type AS ENUM (
      'MALE', 
      'FEMALE', 
      'NON_BINARY', 
      'PREFER_NOT_TO_SAY'
    );
  END IF;
END $$;
