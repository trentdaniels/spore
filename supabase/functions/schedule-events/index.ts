// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { drizzle } from 'drizzle-orm/postgres-js'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { nanoid } from 'nanoid'
import postgres from 'postgres'
import * as v from 'valibot'
import * as schema from '../_shared/schema.ts'

Deno.serve(async (req) => {
	const { DATABASE_URL } = v.parse(v.object({ DATABASE_URL: v.string('MISSING DATABASE_URL') }), Deno.env.toObject())
	const client = postgres(DATABASE_URL, { prepare: false })
	const db = drizzle({
		client,
		casing: 'snake_case',
		schema,
	})

	const payload = await req.json()
	const { time } = v.parse(v.object({ time: v.string() }), payload)

	const calendarDate = Temporal.PlainDate.from(time)

	const createdIds = await db.transaction(async (tx) => {
		const todayEvents = await tx.query.habitEvents.findMany({
			where: (habitEvents, { eq }) => eq(habitEvents.scheduledAt, calendarDate.toString()),
			columns: {
				userID: true,
				frequency: true,
				habitID: true,
				scheduledAt: true,
			},
		})

		if (!todayEvents.length) {
			console.log(`No new events today (${time}). Skipping New Event Insertion`)
			return []
		}

		const nextEvents = todayEvents.map((todayEvent) => {
			const scheduledDate = Temporal.PlainDate.from(todayEvent.scheduledAt)

			const nextScheduledAt = getNextScheduledAt(scheduledDate, todayEvent.frequency)
			return {
				...todayEvent,
				id: nanoid(),
				rowVersion: 1,
				scheduledAt: nextScheduledAt.toString(),
				completedAt: null,
			} satisfies typeof schema.habitEvents.$inferInsert
		})

		return await tx.insert(schema.habitEvents).values(nextEvents).returning({ id: schema.habitEvents.id })
	})

	console.log(`Created ${createdIds.length} New Habit Events(s)`)

	const data = {
		completedAt: Temporal.Now.plainDateTimeISO(),
		createdIds: createdIds.map(({ id }) => id),
	}

	return Response.json(data)
})

function getNextScheduledAt(scheduledDate: Temporal.PlainDate, weeklyFrequency: (typeof schema.weeklyFrequencies.enumValues)[number]) {
	switch (weeklyFrequency) {
		case 'weekly':
			return scheduledDate.add({ weeks: 1 })
		case 'biweekly':
			return scheduledDate.add({ weeks: 2 })
		default:
			return scheduledDate
	}
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/schedule-events' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"time":"2024-10-29"}'

*/
