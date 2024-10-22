import type { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import { auth as authFunction } from '../../auth'
import { eq, pgDrizzle } from '../../db'
import { users } from '../../db/schema'

async function buildAuthClient(dbClient: string) {
  const auth = authFunction({ dbClient })
  return auth
}

export const authMiddleware = createMiddleware<{
  Variables: { userId: string }
}>(async (ctx: Context, next: Next) => {
  const auth = await buildAuthClient(ctx.env.DATABASE_URL)
  const authorization = ctx.req.raw.headers.get('Authorization')
  const sessionId = auth.readBearerToken(authorization ?? '')

  if (!sessionId) return ctx.text('Unauthorized', 401)

  const { session } = await auth.validateSession(sessionId)

  if (!session) return ctx.text('Unauthorized', 401)

  try {
    const [user] = await pgDrizzle(ctx.env.DATABASE_URL)
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, session.userId))

    if (!users) return ctx.text('Unauthorized', 401)

    ctx.set('userId', user.id)
    await next()
  } catch (error) {
    console.error(error)
    return ctx.text('Invalid token', 401)
  }
})
