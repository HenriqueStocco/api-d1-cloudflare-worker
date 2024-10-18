import { Hono } from 'hono'
import { note } from './router/notes'

export type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.route('/notes', note)

export default app
