import { Hono } from 'hono'
import { note } from './router/notes'

const app = new Hono().basePath('/api')

app.route('/notes', note)

export default app
