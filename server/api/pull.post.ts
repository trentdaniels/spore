import { serverSupabaseClient } from '#supabase/server'
import { nonEmpty, nullable, number, object, pipe, string } from 'valibot'
import { getValibotBody } from '../utils/valibot'

// cvrKey -> ClientViewRecord
const cvrCache = new Map<string, CVR>()

export default defineEventHandler(async (event) => {
	const { userId } = await getValibotQuery(event, object({ userId: pipe(string(), nonEmpty('userId is required.')) }))

	const { clientGroupID, cookie } = await getValibotBody(
		event,
		object({ clientGroupID: string(), cookie: nullable(object({ order: number(), cvrID: string() })) })
	)

	const cvrCache = useStorage('cvr')
	// 1: Fetch prevCVR
	const prevCVR = cookie ? await cvrCache.getItem<CVR>(cookie.cvrID) : null
	// 2: Init baseCVR
	const baseCVR: CVR = prevCVR ?? {}

	// 3: begin transaction
	const supabase = await serverSupabaseClient(event)

	supabase.from('')

	console.log('USER_ID', userId)
	return 'Hello pull.post'
})
