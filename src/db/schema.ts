import {text} from "drizzle-orm/mysql-core";
import {int, sqliteTable} from "drizzle-orm/sqlite-core";

export const note = sqliteTable('note', {
    id: int('id').primaryKey({autoIncrement: true}).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
})
