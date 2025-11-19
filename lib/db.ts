/**
 * Database Connection
 * Centralized database connection using Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create postgres connection
const connectionString = process.env.DATABASE_URL

// For query purposes
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout connection attempts after 10 seconds
})

// Create drizzle instance
export const db = drizzle(client, { schema })

// Export schema for type inference
export { schema }
