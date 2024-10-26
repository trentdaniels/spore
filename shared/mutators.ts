import { createHabitEvent, deleteHabitEvent, updateHabitEvent } from '~~/shared/habitEvents'
import { createHabit, deleteHabit, updateHabit } from '~~/shared/habits'

export type M = typeof mutators

export const mutators = {
	createHabit,
	updateHabit,
	deleteHabit,
	createHabitEvent,
	updateHabitEvent,
	deleteHabitEvent,
} as const
