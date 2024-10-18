import { Hono } from 'hono'

export const note = new Hono().get('/', async ctx => {
  return ctx.json({ message: 'Your notes' }, 200)
})
