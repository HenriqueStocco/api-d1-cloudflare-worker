import { Lucia } from 'lucia'
import type { Client } from 'pg'
import { PostgresAdapter } from './database-adapter'

export function auth(opts: { dbClient: Client }) {
  return new Lucia(new PostgresAdapter(opts.dbClient), {})
}

export { compare, hash } from 'bcryptjs'

declare module 'lucia' {
  interface Register {
    Lucia: typeof auth
  }
}
