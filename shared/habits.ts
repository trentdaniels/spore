import { generate } from '@rocicorp/rails'
import * as v from 'valibot'

const dailyFrequencySchema = v.picklist(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])

const weeklyFrequencySchema = v.picklist(['weekly', 'biweekly', 'monthly'])

export const habitSchema = v.object({
	id: v.string(),
	userID: v.string(),
	description: v.string(),
	name: v.string(),
	dailyFrequency: v.array(dailyFrequencySchema),
	weeklyFrequency: weeklyFrequencySchema,
})

export type Habit = v.InferOutput<typeof habitSchema>
export type DailyFrequency = v.InferOutput<typeof dailyFrequencySchema>
export type WeeklyFrequency = v.InferOutput<typeof weeklyFrequencySchema>

const parseHabit = (input: unknown) => v.parse(habitSchema, input)

export const {
	get: getHabit,
	list: listHabits,
	update: updateHabit,
	init: createHabit,
	delete: deleteHabit,
} = generate('habits', parseHabit)
