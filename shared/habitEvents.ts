import { generate } from '@rocicorp/rails'
import * as v from 'valibot'

export const habitEventSchema = v.object({
	id: v.string(),
	userID: v.string(),
	habitID: v.string(),
	scheduledAt: v.string(),
	completed: v.boolean(),
})

export type HabitEvent = v.InferOutput<typeof habitEventSchema>

const parseHabitEvent = (input: unknown) => v.parse(habitEventSchema, input)

export const {
	get: getHabitEvent,
	list: listHabitEvents,
	update: updateHabitEvent,
	init: createHabitEvent,
	delete: deleteHabitEvent,
} = generate('habitEvents', parseHabitEvent)
