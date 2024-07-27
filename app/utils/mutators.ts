import { createHabit, deleteHabit, updateHabit } from '~~/shared/habits'

export type M = typeof mutators

export const mutators = {
	createHabit,
	updateHabit,
	deleteHabit,
} as const
