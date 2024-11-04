import { habitEventSchema } from '#shared/habitEvents'
import { habitSchema } from '#shared/habits'
import { mutators } from '#shared/mutators'
import { serverSupabaseClient } from '#supabase/server'
import * as v from 'valibot'

const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

const mutationSchema = v.object({
	id: v.number(),
	clientID: v.string(),
	name: v.picklist(objectKeys(mutators)),
	args: v.unknown(),
})

type Mutation = v.InferOutput<typeof mutationSchema>

const pushBody = v.object({
	clientGroupID: v.string(),
	mutations: v.array(mutationSchema),
})

export default defineEventHandler(async (event) => {
	const { id: userID } = await ensureUser(event)

	const push = await getValibotBody(event, pushBody)

	const allAffected = {
		habitIDs: new Set<string>(),
		habitEventIDs: new Set<string>(),
		userIDs: new Set<string>(),
	}

	const db = useDB()
	for (const mutation of push.mutations) {
		try {
			const affected = await processMutation(db, userID, push.clientGroupID, mutation)

			for (const habitID of affected.habitIDs) allAffected.habitIDs.add(habitID)
			for (const habitEventID of affected.habitEventIDs) allAffected.habitEventIDs.add(habitEventID)
			for (const userID of affected.userIDs) allAffected.userIDs.add(userID)
		} catch {
			await processMutation(db, userID, push.clientGroupID, mutation, true)
		}
	}

	const client = await serverSupabaseClient(event)

	// NOTE: If there is ever a usecase to send out individual events for specific updates,
	// THis code would come into play. For now, we only need to let this user know that changes occurred
	// for (const habitID of allAffected.habitIDs) {
	// 	const habitChannel = client.channel(`habits/${habitID}`).subscribe(async (status) => {
	// 		if (status !== 'SUBSCRIBED') return
	// 		await habitChannel.send({ type: 'broadcast', event: 'poke' })
	// 		habitChannel.unsubscribe()
	// 	})
	// }

	// for (const habitEventID of allAffected.habitEventIDs) {
	// 	const habitEventChannel = client.channel(`habitEvents/${habitEventID}`).subscribe(async (status) => {
	// 		if (status !== 'SUBSCRIBED') return
	// 		await habitEventChannel.send({ type: 'broadcast', event: 'poke' })
	// 		habitEventChannel.unsubscribe()
	// 	})
	// }

	// for (const userID of allAffected.userIDs) {
	// 	const userChannel = client.channel(`users/${userID}`).subscribe(async (status) => {
	// 		if (status !== 'SUBSCRIBED') return
	// 		await userChannel.send({ type: 'broadcast', event: 'poke' })
	// 		userChannel.unsubscribe()
	// 	})
	// }

	const userChannel = client.channel(`users/${userID}`).subscribe(async (status) => {
		if (status !== 'SUBSCRIBED') return
		await userChannel.send({ type: 'broadcast', event: 'poke' })
		userChannel.unsubscribe()
	})

	// Ensures that we send a 200 back. This helps replicache make sure that the update was successful
	return {}
})

// Implements the push algorithm from
// https://doc.replicache.dev/strategies/row-version#push
async function processMutation(
	db: Tx,
	userID: string,
	clientGroupID: string,
	mutation: Mutation,
	// 1: `let errorMode = false`. In JS, we implement this step naturally
	// as a param. In case of failure, caller will call us again with `true`.
	errorMode = false
) {
	// 2: beginTransaction
	return await db.transaction(async (tx) => {
		let affected: AffectedIDsByEntity = { habitIDs: [], userIDs: [], habitEventIDs: [] }

		// 3: `getClientGroup(body.clientGroupID)`
		// 4: Verify requesting user owns cg (in function)
		const clientGroup = await getReplicacheClientGroupById(tx, { userID, clientGroupID })

		// 5: `getClient(mutation.clientID)`
		// 6: Verify requesting client group owns requested client
		const baseClient = await getReplicacheClient(tx, { clientID: mutation.clientID, clientGroupID: clientGroup.id })

		// 7: init nextMutationID
		const nextRowVersion = baseClient.rowVersion + 1

		// 8: rollback and skip if already processed.
		if (mutation.id < nextRowVersion) {
			console.log(`Mutation ${mutation.id} has already been processed - skipping`)
			return affected
		}

		// 9: Rollback and error if from future.
		if (mutation.id > nextRowVersion) {
			throw new Error(`Mutation ${mutation.id} is from the future - aborting`)
		}

		if (!errorMode) {
			try {
				// 10(i): Run business logic
				// 10(i)(a): xmin column is automatically updated by Postgres for any
				//   affected rows.
				affected = await mutate(tx, userID, mutation)
			} catch (e) {
				// 10(ii)(a-c): log error, abort, and retry
				throw createError({
					statusCode: HttpStatusCode.InternalError,
					cause: e,
					message: `Error executing mutation: ${JSON.stringify(mutation)}: ${e}`,
				})
			}
		}

		// 11-12: put client and client group
		const nextClient = {
			id: mutation.clientID,
			clientGroupID: clientGroup.id,
			rowVersion: nextRowVersion,
		}

		await Promise.all([upsertReplicacheClientGroup(tx, clientGroup), upsertReplicacheClient(tx, nextClient)])

		return affected
	})
}

async function mutate(tx: TxTransaction, userID: string, mutation: Mutation) {
	switch (mutation.name) {
		case 'createHabit':
			return insertHabit(tx, userID, v.parse(habitSchema, mutation.args))
		case 'deleteHabit':
			return deleteHabit(tx, userID, v.parse(v.string(), mutation.args))
		case 'createHabitEvent':
			return insertHabitEvent(tx, userID, v.parse(habitEventSchema, mutation.args))
		case 'createHabitEvents':
			return insertHabitEvents(tx, userID, v.parse(v.array(habitEventSchema), mutation.args))
		case 'updateHabitEvent':
			return updateHabitEvent(tx, userID, v.parse(habitEventSchema, mutation.args))
		default:
			return {
				habitIDs: [],
				userIDs: [],
				habitEventIDs: [],
			} satisfies AffectedIDsByEntity
	}
}
