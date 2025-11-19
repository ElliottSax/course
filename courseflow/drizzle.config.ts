import type { Config } from 'drizzle-kit'

// Note: For build purposes, DATABASE_URL is not required at compile time
// It will be provided at runtime via environment variables

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://placeholder',
  },
} satisfies Config
