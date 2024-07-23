import * as v from 'valibot'

export const searchReplicacheClients = async (tx: typeof drizzleDB, { clientGroupID }: { clientGroupID: string }) => {
	try {
		const clients = await tx.query.replicacheClients.findMany({
			where: (replicacheClients, { eq }) => eq(replicacheClients.clientGroupID, clientGroupID),
		})
		const parsedClients = await v.parseAsync(searchResultListSchema, clients)
		return parsedClients
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: '[searchReplicacheClients] client group retrieval failed',
			data: err,
		})
	}
}
