import { type InferSelectModel, relations } from 'drizzle-orm'
import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: uuid('id').primaryKey().notNull().unique(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull(),
  password: varchar('password').notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: false,
    mode: 'date',
  }).notNull(),
})

export const userRelations = relations(user, ({ many }) => ({
  notes: many(note),
}))

export const userSession = pgTable('session', {
  id: uuid('id')
    .primaryKey()
    .notNull()
    .unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),

  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: false
  }).notNull(),
})

export const note = pgTable('note', {
  id: integer('id').primaryKey().notNull(),
  title: varchar('title', {length: 100}).notNull(),
  description: varchar('description').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: false }).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: false }).notNull(),
})

export const noteRelations = relations(note, ({ one }) => ({
  user: one(user, {
    fields: [note.userId],
    references: [user.id],
  }),
}))

export type User = InferSelectModel<typeof user>
export type Session = InferSelectModel<typeof userSession>
