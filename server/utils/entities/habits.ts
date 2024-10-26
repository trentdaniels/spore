import { and, eq } from 'drizzle-orm'
import * as v from 'valibot'
import { habits } from '~~/shared/db.schema'
import { habitSchema, type Habit } from '~~/shared/habits'

export async function searchHabits(tx: TxTransaction, { userID }: { userID: string }) {
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
			cause: err,
		})
	}
}

export async function getHabits(tx: TxTransaction, { habitIDs }: { habitIDs: string[] }) {
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
			cause: err,
		})
	}
}

export async function insertHabit(tx: TxTransaction, userID: string, habit: Habit) {
	try {
		if (habit.userID !== userID)
			throw createError({
				statusCode: HttpStatusCode.Unauthenticated,
				message: 'User does not own habit',
			})

		await tx.insert(habits).values({ ...habit, rowVersion: 1 })
		return {
			habitIDs: [habit.id],
			habitEventIDs: [],
			userIDs: [habit.userID],
		} satisfies AffectedIDsByEntity
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${insertHabit.name}] habit insertion failed`,
			cause: err,
		})
	}
}

export async function deleteHabit(tx: TxTransaction, userID: string, habitID: string) {
	try {
		const habit = await tx.query.habits.findFirst({
			where: (habits, { eq, and }) => and(eq(habits.id, habitID), eq(habits.userID, userID)),
		})
		if (!habit)
			throw createError({
				statusCode: HttpStatusCode.NotFound,
				message: 'Habit not found',
			})

		await tx.delete(habits).where(and(eq(habits.id, habitID), eq(habits.userID, userID)))
		return {
			habitIDs: [habit.id],
			userIDs: [habit.userID],
			habitEventIDs: [],
		} satisfies AffectedIDsByEntity
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${deleteHabit.name}] habit insertion failed`,
			cause: err,
		})
	}
}
