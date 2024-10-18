import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Bindings } from '..'
import { database, asc, eq } from '../db'
import { note } from '../db/schema'

export const notes = new Hono<{ Bindings: Bindings }>()

/**
 * Get all notes
 */
notes.get('/', async ctx => {
  try {
    const allNotes = await database(ctx.env.DB)
      .select()
      .from(note)
      .orderBy(asc(note.id))

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
notes.get(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.coerce.number(),
    }),
  ),
  async ctx => {
    const { id } = ctx.req.valid('param')

    if (!id) return ctx.text('Missing note id', 400)

    try {
      const note = await database(ctx.env.DB).query.note.findFirst({
        where: (note, { eq }) => eq(note.id, id),
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
notes.post(
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

    try {
      await database(ctx.env.DB)
        .insert(note)
        .values({
          title,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
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
notes.put(
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

    try {
      const noteIdExists = await database(ctx.env.DB).query.note.findFirst({
        where: (note, { eq }) => eq(note.id, id),
      })

      if (!noteIdExists) return ctx.text('Note id not exists', 404)

      await database(ctx.env.DB)
        .update(note)
        .set({
          title: title,
          description: description,
          updatedAt: new Date(),
        })
        .where(eq(note.id, id))

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
notes.patch(
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

    if (!id || !title) return ctx.text('Missing note id or new title', 400)

    try {
      const noteIdExists = await database(ctx.env.DB).query.note.findFirst({
        where: (note, { eq }) => eq(note.id, id),
      })

      if (!noteIdExists) return ctx.text('Note id not exists', 404)

      await database(ctx.env.DB)
        .update(note)
        .set({ title, updatedAt: new Date() })
        .where(eq(note.id, id))

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
notes.patch(
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

    if (!id || !description) {
      return ctx.text('Missing note id or new description', 400)
    }

    try {
      const noteIdExists = await database(ctx.env.DB).query.note.findFirst({
        where: (note, { eq }) => eq(note.id, id),
      })

      if (!noteIdExists) return ctx.text('Note id not exists', 404)

      await database(ctx.env.DB)
        .update(note)
        .set({
          description,
          updatedAt: new Date(),
        })
        .where(eq(note.id, id))
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
notes.delete(
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

    try {
      const noteExist = await database(ctx.env.DB).query.note.findFirst({
        where: (note, { eq }) => eq(note.id, id),
      })

      if (!noteExist) return ctx.text('Note was deleted or no exist', 404)

      await database(ctx.env.DB).delete(note).where(eq(note.id, id)).returning()

      return ctx.text('Note was delete successfully', 200)
    } catch (error) {
      console.error(error)
      return ctx.text('Internal Server Error', 500)
    }
  },
)

/**
 * Delete all notes

notes.delete('/all', async ctx => {
  try {
    await database(ctx.env.DB).delete(note)

    return ctx.text('All notes was deleted successfully', 200)
  } catch (error) {
    console.error(error)
    return ctx.text('Internal Server Error', 500)
  }
})
*/
