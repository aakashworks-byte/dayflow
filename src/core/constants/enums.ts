/**
 * Dayflow Domain Enums matching PostgreSQL Custom Types
 */
export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACTOR: 'CONTRACTOR',
  INTERN: 'INTERN',
} as const;

export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];

export const EmploymentStatus = {
  ACTIVE: 'ACTIVE',
  PROBATION: 'PROBATION',
  NOTICE_PERIOD: 'NOTICE_PERIOD',
  ON_LEAVE: 'ON_LEAVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
} as const;

export type EmploymentStatus = (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

export const GenderType = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  NON_BINARY: 'NON_BINARY',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
} as const;

export type GenderType = (typeof GenderType)[keyof typeof GenderType];
