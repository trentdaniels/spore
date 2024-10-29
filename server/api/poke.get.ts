import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const user = await ensureUser(event)

	const client = await serverSupabaseClient(event)

	const stream = createEventStream(event)
	const clientChannel = client.channel(`users/${user.id}`)

	clientChannel
		.on('broadcast', { event: 'poke' }, () => stream.push({ event: 'poke', data: `Message @ ${new Date().toISOString()}` }))
		.subscribe((status) => {
			if (status !== 'SUBSCRIBED') return
			stream.push({ event: 'beat', data: `subscribed to channel users/${user.id}` })
		})

	stream.onClosed(async () => {
		await clientChannel.unsubscribe()
		await stream.close()
	})

	return stream.send()
})
