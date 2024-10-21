import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import type { Client } from 'pg'

export const pgDrizzle = (client: Client) => {
  return drizzle(client, { schema, logger: true })
}

export { eq, and, asc, sql, lte } from 'drizzle-orm'
export { schema }
export type { Client }
