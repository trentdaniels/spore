import { isClient } from '@vueuse/core'
import type { Reactive } from 'vue'

type Subscribable<Tx> = {
	subscribe: <TData>(query: (tx: Tx) => Promise<TData>, options: { onData: (data: TData) => void }) => () => void
}

export type UseSubscribeOptions<TDefault> = {
	/** Default can already be undefined since it is an unbounded type parameter. */
	defaultValue?: TDefault
}

export const useSubscribe = <Tx, TQueryReturn>(
	r: Reactive<Subscribable<Tx>>,
	query: (tx: Tx) => Promise<TQueryReturn>,
	options: UseSubscribeOptions<TQueryReturn | null> = {}
) => {
	const { defaultValue = null } = options
	const querySnapshot = shallowRef<TQueryReturn | null>(defaultValue)

	let unsubscribe: () => void = () => null

	watchEffect(() => {
		console.log('called')
		if (!isClient) return
		unsubscribe()
		unsubscribe = r.subscribe(query, {
			onData: (data) => (querySnapshot.value = data),
		})
	})

	onUnmounted(() => {
		unsubscribe()
	})

	return querySnapshot
}
