import { Hono } from 'hono'
import { note } from './note-block-routes'

const app = new Hono().basePath('/api')

app.route('/notes', note)

export default app
