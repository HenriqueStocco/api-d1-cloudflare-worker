import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export const database = (databaseClient: D1Database) =>
  drizzle(databaseClient, {
    schema: schema,
    logger: true,
  })

export { eq, and, asc } from 'drizzle-orm'
export { schema }
