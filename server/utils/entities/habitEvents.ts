import * as v from 'valibot'
import { habitEvents } from '~~/shared/db.schema'
import { type HabitEvent, habitEventSchema } from '~~/shared/habitEvents'

export async function searchHabitEvents(tx: TxTransaction, { userID }: { userID: string }) {
	try {
		const clients = await tx.query.habitEvents.findMany({
			where: (habitEvents, { eq }) => eq(habitEvents.userID, userID),
		})
		const parsedSearch = await v.parseAsync(searchResultListSchema, clients)
		return parsedSearch
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${searchHabitEvents.name}] habitEvents retrieval failed`,
			cause: err,
		})
	}
}

export async function getHabitEvents(tx: TxTransaction, { habitEventIDs }: { habitEventIDs: string[] }) {
	try {
		const habitEvents = await tx.query.habitEvents.findMany({
			where: (habitEvents, { inArray }) => inArray(habitEvents.id, habitEventIDs),
		})
		const parsedHabits = await v.parseAsync(v.array(habitEventSchema), habitEvents)
		return parsedHabits
	} catch (err) {
		console.log(JSON.stringify(err, undefined, 2))
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${getHabitEvents.name}] habitEvents retrieval failed`,
			cause: err,
		})
	}
}

export async function insertHabitEvent(tx: TxTransaction, userID: string, habitEvent: HabitEvent) {
	try {
		if (habitEvent.userID !== userID)
			throw createError({
				statusCode: HttpStatusCode.Unauthorized,
				message: 'User does not own habit event',
			})

		await tx.insert(habitEvents).values({ ...habitEvent, rowVersion: 1 })
		return {
			habitIDs: [habitEvent.habitID],
			habitEventIDs: [habitEvent.id],
			userIDs: [habitEvent.userID],
		} satisfies AffectedIDsByEntity
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${insertHabitEvent.name}] habitEvent insertion failed`,
			cause: err,
		})
	}
}
