import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Use placeholder URL during build if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'

// Create postgres client
const client = postgres(databaseUrl)

// Create drizzle instance
export const db = drizzle(client, { schema })
