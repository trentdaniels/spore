import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: uuid('id').primaryKey(),
	email: text('email').unique().notNull(),
	name: text('name'),
	createdAt: timestamp('createdAt', { precision: 6, withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updatedAt', { precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => sql`current_timestamp(6)`),
})
