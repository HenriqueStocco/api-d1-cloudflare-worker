import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { Bindings } from '..'
import { auth as authFunction, compare, genSalt, hash } from '../auth'
import { pgDrizzle } from '../db'
import { users } from '../db/schema'

export const user = new Hono<{ Bindings: Bindings }>()

async function buildAuthClient(dbClient: string) {
  const auth = authFunction({ dbClient })

  return auth
}

user.post(
  '/sign-up',
  zValidator(
    'json',
    z.object({
      name: z.string().min(4, { message: 'At least 4 characters' }),
      email: z.string().email(),
      password: z.string().min(8, { message: 'At least 8 characters' }),
    }),
  ),
  async ctx => {
    const { name, email, password } = ctx.req.valid('json')

    if (!name || !email || !password) {
      return ctx.text('Missing name or email or password', 400)
    }

    const salt = await genSalt(10)
    const hashedPassword = await hash(password, salt)

    try {
      await pgDrizzle(ctx.env.DATABASE_URL)
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning()

      return ctx.text('User created successfully', 201)
    } catch (error) {
      console.error(error)
      return ctx.text(String(error), 500)
    }
  },
)

user.post(
  '/sign-in',
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      password: z.string().min(8, { message: 'At least 8 characters' }),
    }),
  ),
  async ctx => {
    const auth = await buildAuthClient(ctx.env.DATABASE_URL)
    const { email, password } = ctx.req.valid('json')

    if (!email || !password) {
      return ctx.text('Missing Email or Password, both required', 400)
    }

    try {
      const userRecord = await pgDrizzle(
        ctx.env.DATABASE_URL,
      ).query.users.findFirst({
        where: (user, { eq }) => eq(user.email, email),
      })

      const passwordMatches =
        userRecord?.password && (await compare(password, userRecord.password))

      if (!userRecord || !passwordMatches) {
        return ctx.text('Invalid credentials', 401)
      }

      const session = await auth.createSession(userRecord.id, {})

      return ctx.text('Login succesfull', 200)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
  },
)

user.get('/log-out', async ctx => {
  try {
    const auth = await buildAuthClient(ctx.env.DATABASE_URL)
    const authorization = ctx.req.raw.headers.get('Authorization')
    const sessionId = auth.readBearerToken(authorization ?? '')

    if (!sessionId) return ctx.text('Unauthorized', 401)

    if (sessionId) {
      await auth.invalidateSession(sessionId)
      return ctx.text('Successfully logged out', 200)
    }
  } catch (error) {
    console.error(error)
    return ctx.text('Internal Server Error', 500)
  }
})
