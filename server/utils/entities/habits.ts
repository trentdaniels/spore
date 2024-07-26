import { habits } from '@server/schema/db.schema'
import * as v from 'valibot'
import { habitSchema, type Habit } from '~~/shared/habits'

export async function searchHabits(tx: typeof drizzleDB, { userID }: { userID: string }) {
	try {
		const clients = await tx.query.habits.findMany({
			where: (habits, { eq }) => eq(habits.userID, userID),
		})
		const parsedSearch = await v.parseAsync(searchResultListSchema, clients)
		return parsedSearch
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${searchHabits.name}] habits retrieval failed`,
			data: err,
		})
	}
}

export async function getHabits(tx: typeof drizzleDB, { habitIDs }: { habitIDs: string[] }) {
	try {
		const habits = await tx.query.habits.findMany({
			where: (habits, { inArray }) => inArray(habits.id, habitIDs),
		})
		const parsedHabits = await v.parseAsync(v.array(habitSchema), habits)
		return parsedHabits
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${getHabits.name}] habits retrieval failed`,
			data: err,
		})
	}
}

export async function insertHabit(tx: typeof drizzleDB, userID: string, habit: Habit): Promise<AffectedIDsByEntity> {
	try {
		if (habit.userID !== userID)
			throw createError({
				statusCode: HttpStatusCode.Unauthenticated,
				message: 'User does not own habit',
			})

		await tx.insert(habits).values({ ...habit, rowVersion: 1 })
		return {
			habitIDs: [],
			userIDs: [habit.userID],
		}
	} catch (err) {
		console.log('INSERT_HABIT', err)
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${insertHabit.name}] habit insertion failed`,
			data: err,
		})
	}
}
