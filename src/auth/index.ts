import { Lucia } from 'lucia'
import { PostgresAdapter } from './database-adapter'

export function auth(opts: { dbClient: string }) {
  return new Lucia(new PostgresAdapter(opts.dbClient), {})
}

export { compare, hash, genSalt } from 'bcryptjs'

declare module 'lucia' {
  interface Register {
    Lucia: typeof auth
  }
}
