import { createHabit, updateHabit } from '~~/shared/habits'

export type M = typeof mutators

export const mutators = {
	createHabit,
	updateHabit,
} as const
