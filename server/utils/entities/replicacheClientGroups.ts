import * as v from 'valibot'
import { replicacheClientGroups } from '~~/schema/db.schema'

const clientGroupSchema = v.object({
	userID: v.string(),
	cvrVersion: v.number(),
	id: v.string(),
})

export const getReplicacheClientGroupById = async (
	tx: typeof drizzleDB,
	{ clientGroupID, userID }: { clientGroupID: string; userID: string }
) => {
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
			message: '[getReplicacheClientGroupById] client group retrieval failed',
			data: err,
		})
	}
}

export const upsertReplicacheClientGroup = async (tx: typeof drizzleDB, clientGroup: v.InferOutput<typeof clientGroupSchema>) => {
	console.log('CLIENT_GROUP', clientGroup)
	try {
		await tx
			.insert(replicacheClientGroups)
			.values(clientGroup)
			.onConflictDoUpdate({
				target: replicacheClientGroups.id,
				set: { cvrVersion: clientGroup.cvrVersion, userID: clientGroup.userID },
			})
	} catch (err) {
		throw createError({
			statusCode: HttpStatusCode.InternalError,
			message: '[upsertReplicacheClientGroup] client group retrieval failed',
			data: err,
		})
	}
}
