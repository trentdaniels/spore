import { generate } from '@rocicorp/rails'
import * as v from 'valibot'

export const habitSchema = v.object({
	id: v.string(),
	userID: v.string(),
	name: v.string(),
})

export type Habit = v.InferOutput<typeof habitSchema>

const parseHabit = (input: unknown) => v.parse(habitSchema, input)

export const { get: getHabit, list: listHabits, update: updateHabit, init: createHabit } = generate('habits', parseHabit)
