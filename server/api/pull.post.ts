import { nanoid } from 'nanoid'
import type { PatchOperation, PullResponse } from 'replicache'
import * as v from 'valibot'

const cookieSchema = v.object({ order: v.number(), cvrID: v.string() })
const clientGroupWithCookieSchema = v.object({
	clientGroupID: v.string(),
	cookie: v.nullable(cookieSchema),
})

export default defineEventHandler(async (event): Promise<PullResponse> => {
	const [{ id: userID }, { clientGroupID, cookie }] = await Promise.all([
		ensureUser(event),
		getValibotBody(event, clientGroupWithCookieSchema),
	])

	// cvrKey -> ClientViewRecord
	const cvrCache = useStorage('cvr')
	// 1: Fetch prevCVR
	const prevCVR = cookie ? await cvrCache.getItem<CVR>(cookie.cvrID) : null
	// 2: Init baseCVR
	const baseCVR: CVR = prevCVR ?? {}

	// 3: begin transaction
	const db = await useDB(event)
	const result = await db.rls(async (tx) => {
		// 4-5: getClientGroup(body.clientGroupID), verify user
		const baseClientGroupRecord = await getReplicacheClientGroupById(tx, { userID, clientGroupID })

		const [habitsMeta, habitEventsMeta, clientMeta] = await Promise.all([
			// 6: Read all domain data, just ids and versions
			// TODO: Add Domain entities to this call
			searchHabits(tx, { userID }),
			searchHabitEvents(tx, { userID }),
			// 7: Read all clients in CG
			searchReplicacheClients(tx, { clientGroupID }),
		])

		const nextCVR: CVR = {
			habits: toCVREntries(habitsMeta),
			habitEvents: toCVREntries(habitEventsMeta),
			clients: toCVREntries(clientMeta),
		}

		// 9: calculate diffs
		const diff = diffCVR(baseCVR, nextCVR)

		// 10: If diff is empty, return no-op PR
		if (prevCVR && isCVRDiffEmpty(diff)) {
			return null
		}

		// 11: get entities by diff
		const [habits, habitEvents] = await Promise.all([
			getHabits(tx, { habitIDs: diff.habits.puts }),
			getHabitEvents(tx, { habitEventIDs: diff.habitEvents.puts }),
		])

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
				habitEvents: { dels: diff.habitEvents.deletes, puts: habitEvents },
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
	// If there is no previous cvr, start off with clearing
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
	const newCookie: v.InferOutput<typeof cookieSchema> = {
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
