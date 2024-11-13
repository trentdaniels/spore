import { habitEvents } from '#shared/utils/db.schema'
import { and, eq, sql } from 'drizzle-orm'
import * as v from 'valibot'

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

export async function updateHabitEventInformation(tx: TxTransaction, userID: string, habitEvent: HabitEvent) {
	try {
		if (habitEvent.userID !== userID)
			throw createError({
				statusCode: HttpStatusCode.Unauthorized,
				message: 'User does not own habit event',
			})

		const { id, completed, ...valuesToUpdate } = habitEvent
		await tx
			.update(habitEvents)
			.set({ ...valuesToUpdate, rowVersion: sql`${habitEvents.rowVersion} + 1` })
			.where(and(eq(habitEvents.id, id), eq(habitEvents.userID, userID)))
		return {
			habitIDs: [],
			habitEventIDs: [habitEvent.id],
			userIDs: [habitEvent.userID],
		} satisfies AffectedIDsByEntity
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${updateHabitEventInformation.name}] habitEvent insertion failed`,
			cause: err,
		})
	}
}

export async function insertHabitEvents(tx: TxTransaction, userID: string, events: HabitEvent[]) {
	try {
		if (events.some((habitEvent) => habitEvent.userID !== userID))
			throw createError({
				statusCode: HttpStatusCode.Unauthorized,
				message: 'User does not own habit event',
			})

		const habitEventsWithRowVersions = events.map((habitEvent) => ({ ...habitEvent, rowVersion: 1 }))

		await tx.insert(habitEvents).values(habitEventsWithRowVersions)
		return {
			habitIDs: [],
			habitEventIDs: habitEventsWithRowVersions.map((habitEvent) => habitEvent.id),
			userIDs: Array.from(new Set(habitEventsWithRowVersions.map((habitEvent) => habitEvent.userID))),
		} satisfies AffectedIDsByEntity
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${insertHabitEvents.name}] habitEvent insertion failed`,
			cause: err,
		})
	}
}
