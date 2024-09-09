import { sql } from 'drizzle-orm'
import * as v from 'valibot'
import { replicacheClients } from '~~/server/database/db.schema'

const clientSchema = v.object({
	id: v.string(),
	clientGroupID: v.string(),
	rowVersion: v.number(),
})

type ClientRecord = v.InferOutput<typeof clientSchema>

export const searchReplicacheClients = async (tx: Tx, { clientGroupID }: { clientGroupID: string }) => {
	try {
		const clients = await tx.query.replicacheClients.findMany({
			where: (replicacheClients, { eq }) => eq(replicacheClients.clientGroupID, clientGroupID),
		})
		const parsedClients = await v.parseAsync(searchResultListSchema, clients)
		return parsedClients
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${searchReplicacheClients.name}] client group retrieval failed`,
			data: err,
		})
	}
}

export async function getReplicacheClient(
	tx: Tx,
	{ clientID, clientGroupID }: { clientID: string; clientGroupID: string }
): Promise<ClientRecord> {
	const client = await tx.query.replicacheClients.findFirst({
		where: (replicacheClients, { eq }) => eq(replicacheClients.id, clientID),
	})

	if (!client)
		return {
			id: clientID,
			clientGroupID: '',
			rowVersion: 0,
		}

	const parsedClient = await v.parseAsync(clientSchema, client)

	if (client.clientGroupID !== clientGroupID)
		throw createError({
			statusCode: HttpStatusCode.Unauthorized,
			message: `[${getReplicacheClient.name}] Authorization Error - client does not belong to client group`,
		})

	return parsedClient
}

export async function upsertReplicacheClient(tx: Tx, client: ClientRecord) {
	try {
		await tx
			.insert(replicacheClients)
			.values(client)
			.onConflictDoUpdate({
				target: replicacheClients.id,
				set: { rowVersion: client.rowVersion, clientGroupID: client.clientGroupID, updatedAt: sql`excluded.updated_at` },
			})
	} catch (err) {
		console.log('ERR', err)
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${upsertReplicacheClient.name}] client group retrieval failed`,
			data: err,
		})
	}
}
