import { replicacheClientGroups } from '#shared/utils/db.schema'
import { sql } from 'drizzle-orm'
import * as v from 'valibot'

const clientGroupSchema = v.object({
	userID: v.string(),
	cvrVersion: v.number(),
	id: v.string(),
})

export async function getReplicacheClientGroupById(
	tx: TxTransaction,
	{ clientGroupID, userID }: { clientGroupID: string; userID: string }
) {
	try {
		const clientGroup = await tx.query.replicacheClientGroups.findFirst({
			where: (replicacheClientGroups, { eq }) => eq(replicacheClientGroups.id, clientGroupID),
			columns: {
				id: true,
				userID: true,
				cvrVersion: true,
			},
		})

		if (!clientGroup) {
			return {
				userID,
				id: clientGroupID,
				cvrVersion: 0,
			}
		}

		const parsedClientGroup = await v.parseAsync(clientGroupSchema, clientGroup)

		if (parsedClientGroup.userID !== userID) {
			throw createError({ statusCode: HttpStatusCode.Unauthorized, message: 'User does not own client group.' })
		}

		return {
			id: clientGroupID,
			userID: parsedClientGroup.userID,
			cvrVersion: parsedClientGroup.cvrVersion,
		}
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${getReplicacheClientGroupById.name}] client group retrieval failed`,
			cause: err,
		})
	}
}

export async function upsertReplicacheClientGroup(tx: TxTransaction, clientGroup: v.InferOutput<typeof clientGroupSchema>) {
	try {
		await tx
			.insert(replicacheClientGroups)
			.values(clientGroup)
			.onConflictDoUpdate({
				target: replicacheClientGroups.id,
				set: { cvrVersion: clientGroup.cvrVersion, userID: clientGroup.userID, updatedAt: sql`excluded.updated_at` },
			})
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: `[${upsertReplicacheClientGroup.name}] client group retrieval failed`,
			cause: err,
		})
	}
}
