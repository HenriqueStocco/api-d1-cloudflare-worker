import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { Bindings } from '..'
import { asc, eq, pgDrizzle, sql } from '../db'
import { notes } from '../db/schema'
import { authMiddleware } from './middlewares/authentication'

export const note = new Hono<{ Bindings: Bindings }>()
note.use(authMiddleware)

/**
 * Get all notes
 */
note.get('/', async ctx => {
  const userId = ctx.var.userId
  try {
    const allNotes = await pgDrizzle(ctx.env.DATABASE_URL)
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(asc(notes.id))

    if (allNotes.length <= 0)
      return ctx.json({ message: 'Tasks no exists' }, 200)

    return ctx.json(allNotes)
  } catch (error) {
    console.error(error)
    return ctx.json({ message: 'Internal Server Error' }, 500)
  }
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
    const userId = ctx.var.userId as string

    if (!id) return ctx.text('Missing note id or userId', 400)

    try {
      const note = await pgDrizzle(ctx.env.DATABASE_URL).query.notes.findFirst({
        where: (note, { eq, and }) =>
          and(eq(note.id, id), eq(note.userId, userId)),
      })

      if (!note) return ctx.text('Note not exists', 404)

      return ctx.json(note)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
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
    const userId = ctx.var.userId as string
    const { title, description } = ctx.req.valid('json')

    if (!title || !description)
      return ctx.json(
        { message: 'Missing title or description, both mandatory' },
        400,
      )

    try {
      await pgDrizzle(ctx.env.DATABASE_URL)
        .insert(notes)
        .values({
          userId,
          title,
          description,
          createdAt: sql`NOW()`,
          updatedAt: sql`NOW()`,
        })
        .returning()

      return ctx.text('Note was successfully created', 201)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
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
    const userId = ctx.var.userId as string

    if (!id || !title || !description)
      return ctx.json(
        { message: 'Missing note id or title or description' },
        400,
      )

    try {
      const noteIdExists = await pgDrizzle(
        ctx.env.DATABASE_URL,
      ).query.notes.findFirst({
        where: (note, { eq, and }) =>
          and(eq(note.id, id), eq(note.userId, userId)),
      })

      if (!noteIdExists) return ctx.text('Note id not exists', 404)

      await pgDrizzle(ctx.env.DATABASE_URL)
        .update(notes)
        .set({
          title: title,
          description: description,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, id))

      return ctx.text('Note was successfully updated', 200)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
  },
)

/**
 * Update just the title
 */
note.patch(
  '/:id/title',
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
    const userId = ctx.var.userId as string

    if (!id || !title) return ctx.text('Missing note id or new title', 400)

    try {
      const noteIdExists = await pgDrizzle(
        ctx.env.DATABASE_URL,
      ).query.notes.findFirst({
        where: (note, { eq, and }) =>
          and(eq(note.id, id), eq(note.userId, userId)),
      })

      if (!noteIdExists) return ctx.text('Note id not exists', 404)

      await pgDrizzle(ctx.env.DATABASE_URL)
        .update(notes)
        .set({ title, updatedAt: new Date() })
        .where(eq(notes.id, id))

      return ctx.text('Title was updated successfully', 200)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
  },
)

/**
 * Update just the description
 */
note.patch(
  '/:id/description',
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
    const userId = ctx.var.userId as string

    if (!id || !description) {
      return ctx.text('Missing note id or new description', 400)
    }

    try {
      const noteIdExists = await pgDrizzle(
        ctx.env.DATABASE_URL,
      ).query.notes.findFirst({
        where: (note, { eq, and }) =>
          and(eq(note.id, id), eq(note.userId, userId)),
      })

      if (!noteIdExists) return ctx.text('Note id not exists', 404)

      await pgDrizzle(ctx.env.DATABASE_URL)
        .update(notes)
        .set({
          description,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, id))
        .returning()

      return ctx.text('Description was updated successfully', 200)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
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
    const userId = ctx.var.userId as string

    if (!id) return ctx.text('Missing id', 400)

    try {
      const noteExist = await pgDrizzle(
        ctx.env.DATABASE_URL,
      ).query.notes.findFirst({
        where: (note, { eq, and }) =>
          and(eq(note.id, id), eq(note.userId, userId)),
      })

      if (!noteExist) return ctx.text('Note was deleted or no exist', 404)

      await pgDrizzle(ctx.env.DATABASE_URL)
        .delete(notes)
        .where(eq(notes.id, id))
        .returning()

      return ctx.text('Note was delete successfully', 200)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
  },
)
