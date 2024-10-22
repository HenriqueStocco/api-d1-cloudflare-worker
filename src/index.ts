import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { note } from './router/notes'
import { user } from './router/users'

export type Bindings = {
  DATABASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.use(logger())

function setCorsHeaders(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Request-Method', '*')
  res.headers.set(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH',
  )
  res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.headers.set('Access-Control-Max-Age', '86400')
  res.headers.set('Content-Type', 'application/json')
}

app.route('/notes', note)
app.route('/users', user)

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    if (request.method === 'OPTIONS') {
      const response = new Response(null, {
        status: 204,
      })
      setCorsHeaders(response)
      return response
    }

    return app.fetch(request, env, ctx)
  },
}
