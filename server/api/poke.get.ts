import { serverSupabaseClient } from '#supabase/server'
import * as v from 'valibot'

export default defineEventHandler(async (event) => {
	const { channel } = await getValibotQuery(event, v.object({ channel: v.pipe(v.string(), v.nonEmpty()) }))

	const client = await serverSupabaseClient(event)

	const stream = createEventStream(event)
	const clientChannel = client.channel(channel)

	console.log('CHANNEL', channel)

	// TODO: Filter these events/tables by userId
	clientChannel
		.on('broadcast', { event: 'poke' }, () => stream.push(`Message @ ${new Date().toISOString()}`))
		.subscribe((status) => {
			if (status !== 'SUBSCRIBED') return
			stream.push({ event: 'beat', data: 'subscribed to channel ' + channel })
		})

	stream.onClosed(async () => {
		await clientChannel.unsubscribe()
		await stream.close()
	})

	return stream.send()
})
