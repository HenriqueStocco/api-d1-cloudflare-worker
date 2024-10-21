import { Hono } from 'hono'
import { notes } from './router/notes'
import type { Client } from 'pg'

export type Bindings = {
  DATABASE_URL: Client
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.route('/notes', notes)

export default{
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx)
  }
}
