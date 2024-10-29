import { SQL, sql } from 'drizzle-orm'
import { boolean, date, integer, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

const auditColumns = {
	createdAt: timestamp({ precision: 6, withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp({ precision: 6, withTimezone: true, mode: 'string' })
		.notNull()
		.defaultNow()
		.$onUpdateFn(() => sql`now()`),
}

const rowVersionColumns = {
	rowVersion: integer().notNull(),
}

export const replicacheClientGroups = pgTable('replicache_client_groups', {
	id: varchar({ length: 36 }).primaryKey(),
	userID: varchar({ length: 36 }).notNull(),
	cvrVersion: integer().notNull(),
	...auditColumns,
})

export const replicacheClients = pgTable('replicache_clients', {
	id: varchar('id', { length: 36 }).primaryKey(),
	clientGroupID: varchar({ length: 36 }).notNull(),
	rowVersion: integer('last_mutation_id').notNull(),
	...auditColumns,
})

export const weeklyFrequencies = pgEnum('weekly_frequencies', ['weekly', 'biweekly', 'monthly'])
export const dailyFrequencies = pgEnum('daily_frequencies', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])

export const habits = pgTable('habits', {
	id: varchar({ length: 36 }).primaryKey(),
	userID: varchar({ length: 36 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: varchar(),
	weeklyFrequency: weeklyFrequencies().default('weekly'),
	dailyFrequency: dailyFrequencies().array(),
	...rowVersionColumns,
	...auditColumns,
})

export const habitEvents = pgTable('habit_events', {
	id: varchar({ length: 36 }).primaryKey(),
	userID: varchar({ length: 36 }).notNull(),
	habitID: varchar({ length: 36 }).notNull(),
	dailyFrequency: dailyFrequencies().notNull(),
	completedAt: timestamp({ precision: 6, withTimezone: true, mode: 'string' }),
	completed: boolean()
		.generatedAlwaysAs((): SQL<boolean> => sql`${habitEvents.completedAt} IS NOT NULL`)
		.notNull(),
	scheduledAt: date({ mode: 'string' }).notNull(),
	...rowVersionColumns,
	...auditColumns,
})
