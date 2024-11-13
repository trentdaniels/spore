import { createHabitEvent, createHabitEvents, deleteHabitEvent, updateHabitEvent } from '~~/shared/utils/habitEvents'

export type M = typeof mutators

export const mutators = {
	createHabit,
	updateHabit,
	deleteHabit,
	createHabitEvent,
	createHabitEvents,
	updateHabitEvent,
	deleteHabitEvent,
} as const
