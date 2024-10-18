import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const note = sqliteTable('note', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
