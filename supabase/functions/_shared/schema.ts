import { sql, type SQL } from 'drizzle-orm'
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

export const weeklyFrequencies = pgEnum('weekly_frequencies', ['weekly', 'biweekly'])

export const habitEvents = pgTable('habit_events', {
	id: varchar({ length: 36 }).primaryKey(),
	userID: varchar({ length: 36 }).notNull(),
	habitID: varchar({ length: 36 }).notNull(),
	frequency: weeklyFrequencies().notNull(),
	completedAt: timestamp({ precision: 6, withTimezone: true, mode: 'string' }),
	completed: boolean()
		.generatedAlwaysAs((): SQL<boolean> => sql`${habitEvents.completedAt} IS NOT NULL`)
		.notNull(),
	scheduledAt: date({ mode: 'string' }).notNull(),
	...rowVersionColumns,
	...auditColumns,
})
