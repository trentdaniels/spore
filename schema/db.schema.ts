import { sql } from 'drizzle-orm'
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const replicacheClientGroups = pgTable('replicache_client_groups', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userID: varchar('user_id', { length: 36 }).notNull(),
	cvrVersion: integer('cvr_version').notNull(),
	createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }).notNull().defaultNow(),
})

export const replicacheClients = pgTable('replicache_clients', {
	id: varchar('id', { length: 36 }).primaryKey(),
	clientGroupID: varchar('client_group_id', { length: 36 }).notNull(),
	rowVersion: integer('last_mutation_id').notNull(),
	createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true })
		.notNull()
		.$onUpdateFn(() => sql`now()`),
})

export const habits = pgTable('habits', {
	id: varchar('id', { length: 36 }).primaryKey(),
	ownerID: varchar('owner_id', { length: 36 }).notNull(),
	rowVersion: integer('last_mutation_id').notNull(),
	createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true })
		.notNull()
		.$onUpdateFn(() => sql`now()`),
})
