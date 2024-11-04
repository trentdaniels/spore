import { createHabitEvent, createHabitEvents, deleteHabitEvent, updateHabitEvent } from '#shared/habitEvents'
import { createHabit, deleteHabit, updateHabit } from '#shared/habits'

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
