import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

export const note = new Hono()

/**
 * Get all notes
 */
note.get('/', async ctx => {
  return ctx.json({ message: 'All notes' }, 200)
})

/**
 * Get one specific note by id
 */
note.get(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number(),
    }),
  ),
  async ctx => {
    const { id } = ctx.req.valid('param')

    return ctx.json({ message: `Your note ${id}` }, 200)
  },
)

/**
 * Create a note
 */
note.post(
  '/',
  zValidator(
    'json',
    z.object({
      title: z
        .string()
        .min(4, 'Too short')
        .max(100, 'Its not a title, but a description'),
      description: z.string().min(4, 'Too short for a description'),
    }),
  ),
  async ctx => {
    const { title, description } = ctx.req.valid('json')

    if (!title || !description)
      return ctx.json(
        { message: 'Missing title or description, both mandatory' },
        400,
      )

    return ctx.json({ message: 'Note created' }, 201)
  },
)

/**
 * Update an entire note by id
 */
note.put(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number(),
    }),
  ),
  zValidator(
    'json',
    z.object({
      title: z
        .string()
        .min(4, 'Too short')
        .max(100, 'Its not a title, but a description'),
      description: z.string().min(4, 'Too short for a description'),
    }),
  ),
  async ctx => {
    const { id } = ctx.req.valid('param')
    const { title, description } = ctx.req.valid('json')

    if (!id || !title || !description)
      return ctx.json(
        { message: 'Missing note id or title or description' },
        400,
      )

    return ctx.json(
      { message: 'Task updated successfully', news: { title, description } },
      200,
    )
  },
)

/**
 * Update just the title
 */
note.patch(
  '/:id',
  zValidator('param', z.object({ id: z.coerce.number() })),
  zValidator(
    'json',
    z.object({
      title: z.string().min(4, 'Too short').max(100, 'This is a description'),
    }),
  ),
  async ctx => {
    const { id } = ctx.req.valid('param')
    const { title } = ctx.req.valid('json')

    if (!id || !title) return ctx.text('Missing note id or new title', 400)

    return ctx.text('Title updated successfully', 200)
  },
)

/**
 * Update just the description
 */
note.patch(
  '/:id',
  zValidator('param', z.object({ id: z.coerce.number() })),
  zValidator(
    'json',
    z.object({
      description: z.string().min(4, 'Too short'),
    }),
  ),
  async ctx => {
    const { id } = ctx.req.valid('param')
    const { description } = ctx.req.valid('json')

    if (!id || !description)
      return ctx.text('Missing note id or new description', 400)

    return ctx.text('Description updated successfully', 200)
  },
)

/**
 * Delete one specific note by id
 */
note.delete(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number(),
    }),
  ),
  async ctx => {
    const { id } = ctx.req.valid('param')

    if (!id) return ctx.text('Missing id', 400)

    return ctx.json({ message: 'Note deleted successfully' }, 200)
  },
)

/**
 * Delete all notes
 */
note.delete('/', async ctx => {
  return ctx.text('All notes are deleted')
})
