import { type SQL, sql } from 'drizzle-orm'
import { boolean, date, type ExtraConfigColumn, index, integer, pgEnum, pgPolicy, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { authenticatedRole, authUid } from 'drizzle-orm/supabase'

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

const userIDColumns = {
	userID: varchar({ length: 36 }).notNull(),
}

const createAuthenticatedRolePolicy = (t: { userID: ExtraConfigColumn }) =>
	pgPolicy('authenticated-user-controls-own-entities', {
		as: 'permissive',
		for: 'all',
		to: authenticatedRole,
		using: sql`(((${authUid}::varchar)::text) = (${t.userID})::text)`,
		withCheck: sql`(((${authUid}::varchar)::text) = (${t.userID})::text)`,
	})

const createDefaultAuthenticatedRolePolicy = () =>
	pgPolicy('authenticated-user-can-access', {
		as: 'permissive',
		for: 'all',
		to: authenticatedRole,
		using: sql`(true)`,
		withCheck: sql`(true)`,
	})

const createUserIDIndex = (prefix: string, t: { userID: ExtraConfigColumn }) => index(`${prefix}_userID`).on(t.userID)

export const replicacheClientGroups = pgTable(
	'replicache_client_groups',
	{
		id: varchar({ length: 36 }).primaryKey(),
		cvrVersion: integer().notNull(),
		...auditColumns,
		...userIDColumns,
	},
	(t) => [createAuthenticatedRolePolicy(t), createUserIDIndex('replicache_client_groups', t)]
)

export const replicacheClients = pgTable(
	'replicache_clients',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		clientGroupID: varchar({ length: 36 }).notNull(),
		rowVersion: integer('last_mutation_id').notNull(),
		...auditColumns,
	},
	() => [createDefaultAuthenticatedRolePolicy()]
)

export const weeklyFrequencies = pgEnum('weekly_frequencies', ['weekly', 'biweekly'])
export const dailyFrequencies = pgEnum('daily_frequencies', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])

export const habits = pgTable(
	'habits',
	{
		id: varchar({ length: 36 }).primaryKey(),
		name: varchar({ length: 100 }).notNull(),
		description: varchar(),
		weeklyFrequency: weeklyFrequencies().default('weekly'),
		dailyFrequency: dailyFrequencies().array(),
		...rowVersionColumns,
		...auditColumns,
		...userIDColumns,
	},
	(t) => [createAuthenticatedRolePolicy(t), createUserIDIndex('habits', t)]
)

export const habitEvents = pgTable(
	'habit_events',
	{
		id: varchar({ length: 36 }).primaryKey(),
		habitID: varchar({ length: 36 }).notNull(),
		frequency: weeklyFrequencies().notNull(),
		completedAt: timestamp({ precision: 6, withTimezone: true, mode: 'string' }),
		completed: boolean()
			.generatedAlwaysAs((): SQL<boolean> => sql`${habitEvents.completedAt} IS NOT NULL`)
			.notNull(),
		scheduledAt: date({ mode: 'string' }).notNull(),
		...rowVersionColumns,
		...auditColumns,
		...userIDColumns,
	},
	(t) => [createAuthenticatedRolePolicy(t), createUserIDIndex('habit_events', t)]
)
