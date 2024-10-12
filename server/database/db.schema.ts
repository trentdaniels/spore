import { sql } from 'drizzle-orm'
import { integer, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

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
		.defaultNow()
		.$onUpdateFn(() => sql`now()`),
})

export const weeklyFrequencies = pgEnum('weekly_frequencies', ['weekly', 'biweekly', 'monthly'])
export const dailyFrequencies = pgEnum('daily_frequencies', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])

export const habits = pgTable('habits', {
	id: varchar('id', { length: 36 }).primaryKey(),
	userID: varchar('user_id', { length: 36 }).notNull(),
	name: varchar('name', { length: 100 }).notNull(),
	rowVersion: integer('row_version').notNull(),
	createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => sql`now()`),
})
