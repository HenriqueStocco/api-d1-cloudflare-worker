import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export const pgDrizzle = (client: string) => {
  const neonClient = neon(client)
  return drizzle(neonClient, { schema, logger: true })
}

export { eq, and, asc, sql, lte } from 'drizzle-orm'
export { schema }
