import { nanoid } from 'nanoid'
import { Replicache } from 'replicache'
import * as v from 'valibot'

export default defineNuxtPlugin(() => {
	const runtimeSchema = v.object({
		replicacheLicense: v.pipe(v.string(), v.nonEmpty('replicacheLicense is required.')),
	})
	const { replicacheLicense: licenseKey } = v.parse(runtimeSchema, useRuntimeConfig().public)
	const userID = useLocalStorage('userID', nanoid())

	let replicache = createReplicache(userID.value, licenseKey)
	const tx = reactive({
		subscribe: replicache.subscribe.bind(replicache),
		mutate: replicache.mutate,
	})

	const { event, data } = useEventSource(
		computed(() => `/api/poke?channel=users/${userID.value}`),
		['poke'] as const,
		{ autoReconnect: true }
	)
	watch([event, data], ([event]) => {
		if (event === 'poke') replicache.pull()
	})

	const resetReplicache = async (userID: string) => {
		await replicache.close()
		replicache = createReplicache(userID, licenseKey)
		tx.subscribe = replicache.subscribe.bind(replicache)
		tx.mutate = replicache.mutate
	}

	watch(userID, (userID) => {
		resetReplicache(userID)
	})

	return {
		provide: {
			replicache: readonly(tx),
		},
	}
})

const createReplicache = (userID: string, licenseKey: string) =>
	new Replicache<M>({
		name: userID,
		licenseKey,
		mutators,
		pullURL: `/api/pull?userID=${userID}`,
		pushURL: `/api/push?userID=${userID}`,
		logLevel: import.meta.dev ? 'debug' : 'info',
	})
