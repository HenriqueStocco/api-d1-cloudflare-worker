import { relations } from 'drizzle-orm'
import { pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const userSession = pgTable('session', {
  id: varchar('id').primaryKey().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),

  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: false,
  }).notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull(),
  password: varchar('password').notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: false,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),
})

export const userRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}))

export const notes = pgTable('notes', {
  id: serial('id').primaryKey().notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  description: varchar('description').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),

  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: false,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    withTimezone: false,
  })
    .notNull()
    .defaultNow(),
})

export const noteRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}))
