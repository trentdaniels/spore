import { mutators, type M } from '#shared/mutators'
import { Replicache } from 'replicache'
import * as v from 'valibot'

type Tx = Pick<Replicache<M>, 'subscribe' | 'mutate'>

const runtimeSchema = v.object({
	replicacheLicense: v.pipe(v.string(), v.nonEmpty('replicacheLicense is required.')),
})

export default defineNuxtPlugin(() => {
	const { replicacheLicense: licenseKey } = v.parse(runtimeSchema, useRuntimeConfig().public)
	let replicacheInstance: Replicache<M>
	const replicache = ref<Tx>({} as Tx)

	const user = useSupabaseUser()

	const {
		event,
		data,
		open: openPokeStream,
		close: closePokeStream,
	} = useEventSource(`/api/poke`, ['poke'] as const, { autoReconnect: true, immediate: false })
	watch([event, data], ([event]) => {
		if (event === 'poke') replicacheInstance.pull()
	})

	watchEffect((onCleanup) => {
		if (!user.value) return
		openPokeStream()

		replicacheInstance = createReplicache(user.value.id, licenseKey)
		replicache.value = {
			subscribe: replicacheInstance.subscribe.bind(replicacheInstance),
			mutate: replicacheInstance.mutate,
		}

		onCleanup(() => {
			if (replicacheInstance) replicacheInstance.close()
			closePokeStream()
		})
	})

	return {
		provide: {
			replicache: readonly(toReactive(replicache)),
		},
	}
})

const createReplicache = (userID: string, licenseKey: string) =>
	new Replicache<M>({
		name: userID,
		licenseKey,
		mutators,
		pullURL: `/api/pull`,
		pushURL: `/api/push`,
		logLevel: import.meta.dev ? 'debug' : 'info',
	})
