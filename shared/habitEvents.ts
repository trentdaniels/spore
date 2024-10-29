import { generate } from '@rocicorp/rails'
import type { WriteTransaction } from 'replicache'
import * as v from 'valibot'
import { dailyFrequencies } from './db.schema'

export const habitEventSchema = v.object({
	id: v.string(),
	userID: v.string(),
	habitID: v.string(),
	scheduledAt: v.pipe(v.string(), v.isoDate()),
	dailyFrequency: v.picklist(dailyFrequencies.enumValues),
	completed: v.optional(v.boolean(), false),
	completedAt: v.nullable(v.string(), null),
})

export type HabitEvent = v.InferOutput<typeof habitEventSchema>

const parseHabitEvent = (input: unknown) => v.parse(habitEventSchema, input)

const {
	get: getHabitEvent,
	list: listHabitEvents,
	update: updateHabitEvent,
	init: createHabitEvent,
	delete: deleteHabitEvent,
} = generate('habitEvents', parseHabitEvent)

async function createHabitEvents(tx: WriteTransaction, habitEvents: HabitEvent[]) {
	for (const habitEvent of habitEvents) await createHabitEvent(tx, habitEvent)

	return true
}

export { createHabitEvent, createHabitEvents, deleteHabitEvent, getHabitEvent, listHabitEvents, updateHabitEvent }
