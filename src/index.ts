import { Hono } from 'hono'
import { notes } from './router/notes'

export type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.route('/notes', notes)

export default app
