/**
 * Type definitions and constants for Prisma models
 * 
 * Since SQLite doesn't support enums, we use string literals
 * and TypeScript types for type safety at the application level.
 */

// Role types
export const Role = {
  CLIENT: 'CLIENT',
  TRAINER: 'TRAINER',
  ADMIN: 'ADMIN',
} as const

export type Role = typeof Role[keyof typeof Role]

// Session status types
export const SessionStatus = {
  PLANNED: 'PLANNED',
  CANCELLED: 'CANCELLED',
  FINISHED: 'FINISHED',
} as const

export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus]

// Booking status types
export const BookingStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED_BY_CLIENT: 'CANCELLED_BY_CLIENT',
  CANCELLED_BY_TRAINER: 'CANCELLED_BY_TRAINER',
} as const

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus]




