import { nanoid } from 'nanoid'
import { type PatchOperation, type PullResponse } from 'replicache'
import * as v from 'valibot'

const cookieSchema = v.object({ order: v.number(), cvrID: v.string() })

export default defineEventHandler(async (event): Promise<PullResponse> => {
	const { userID } = await getValibotQuery(event, v.object({ userID: v.pipe(v.string(), v.nonEmpty('userID is required.')) }))

	const { clientGroupID, cookie } = await getValibotBody(event, v.object({ clientGroupID: v.string(), cookie: v.nullable(cookieSchema) }))

	// cvrKey -> ClientViewRecord
	const cvrCache = useStorage('cvr')
	// 1: Fetch prevCVR
	const prevCVR = cookie ? await cvrCache.getItem<CVR>(cookie.cvrID) : null
	// 2: Init baseCVR
	const baseCVR: CVR = prevCVR ?? {}

	// 3: begin transaction
	const result = await useDrizzleDB().transaction(async (tx) => {
		// 4-5: getClientGroup(body.clientGroupID), verify user
		const baseClientGroupRecord = await getReplicacheClientGroupById(tx, { userID, clientGroupID })

		const [habitsMeta, clientMeta] = await Promise.all([
			// 6: Read all domain data, just ids and versions
			// TODO: Add Domain entities to this call
			searchHabits(tx, { userID }),
			// 7: Read all clients in CG
			searchReplicacheClients(tx, { clientGroupID }),
		])

		const nextCVR: CVR = {
			habits: toCVREntries(habitsMeta),
			clients: toCVREntries(clientMeta),
		}

		// 9: calculate diffs
		const diff = diffCVR(baseCVR, nextCVR)

		// 10: If diff is empty, return no-op PR
		if (prevCVR && isCVRDiffEmpty(diff)) {
			return null
		}

		// 11: get entities
		const [habits] = await Promise.all([getHabits(tx, { habitIDs: diff.habits.puts })])

		// 12: changed clients - no need to re-read clients from database,
		// we already have their versions.
		const clients = diff.clients.puts.reduce<CVREntries>((entries, clientID) => {
			entries[clientID] = nextCVR.clients[clientID]
			return entries
		}, {})

		// 13: newCVRVersion
		const baseCVRVersion = cookie?.order ?? 0
		const nextCVRVersion = Math.max(baseCVRVersion, baseClientGroupRecord.cvrVersion) + 1

		// 14: Write ClientGroupRecord
		const nextClientGroupRecord = {
			...baseClientGroupRecord,
			cvrVersion: nextCVRVersion,
		}
		await upsertReplicacheClientGroup(tx, nextClientGroupRecord)

		return {
			entities: {
				habits: { dels: diff.habits.deletes, puts: habits },
				// list: {dels: diff.list.dels, puts: lists},
				// share: {dels: diff.share.dels, puts: shares},
				// todo: {dels: diff.todo.dels, puts: todos},
			},
			clients,
			nextCVR,
			nextCVRVersion,
		}
	})

	// 10: If diff is empty, return no-op PR
	if (!result)
		return {
			cookie,
			lastMutationIDChanges: {},
			patch: [],
		}

	const { entities, clients, nextCVR, nextCVRVersion } = result

	// 16-17: store cvr
	const cvrID = nanoid()
	await cvrCache.setItem(cvrID, nextCVR)

	// 18(i): build patch
	const patch: PatchOperation[] = []
	if (!prevCVR) {
		patch.push({ op: 'clear' })
	}

	for (const [name, { puts, dels }] of Object.entries(entities)) {
		for (const id of dels) {
			// TODO: Add userId from supabase to this key
			patch.push({ op: 'del', key: `${name}/${id}` })
		}
		for (const entity of puts) {
			// TODO: Add userId from supabase to this key
			patch.push({
				op: 'put',
				key: `${name}/${entity.id}`,
				value: entity,
			})
		}
	}

	// 18(ii): construct cookie
	const newCookie: v.InferInput<typeof cookieSchema> = {
		order: nextCVRVersion,
		cvrID,
	}

	return {
		cookie: newCookie,

		// 17(iii): lastMutationIDChanges
		lastMutationIDChanges: clients,
		patch,
	}
})
