import * as v from 'valibot'

const habitSchema = v.object({
	...searchResultSchema.entries,
	ownerID: v.string(),
	updatedAt: v.pipe(v.string(), v.isoTimestamp()),
})

export const searchHabits = async (tx: typeof drizzleDB, { userID }: { userID: string }) => {
	try {
		const clients = await tx.query.habits.findMany({
			where: (habits, { eq }) => eq(habits.ownerID, userID),
		})
		const parsedSearch = await v.parseAsync(searchResultListSchema, clients)
		return parsedSearch
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: '[searchHabits] habits retrieval failed',
			data: err,
		})
	}
}

export const getHabits = async (tx: typeof drizzleDB, { habitIDs }: { habitIDs: string[] }) => {
	try {
		if (!habitIDs.length) return []

		const clients = await tx.query.habits.findMany({
			where: (habits, { inArray }) => inArray(habits.id, habitIDs),
		})
		const parsedClients = await v.parseAsync(v.array(habitSchema), clients)
		return parsedClients
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: '[getHabits] habits retrieval failed',
			data: err,
		})
	}
}
