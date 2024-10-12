import { isClient } from '@vueuse/core'
import type { Reactive } from 'vue'

type Subscribable<Tx> = {
	subscribe: <TData>(query: (tx: Tx) => Promise<TData>, options: { onData: (data: TData) => void }) => () => void
}

type UseSubscribeOptions<TDefault> = {
	/** Default can already be undefined since it is an unbounded type parameter. */
	defaultValue: TDefault
}

export const useSubscribe = <Tx, TQueryReturn>(
	r: Reactive<Subscribable<Tx>>,
	query: (tx: Tx) => Promise<TQueryReturn>,
	options?: UseSubscribeOptions<TQueryReturn>
) => {
	const defaultValue = options?.defaultValue
	const querySnapshot = shallowRef(defaultValue)

	watchEffect((onCleanup) => {
		if (!isClient || !r) return
		const unsubscribe = r.subscribe(query, {
			onData: (data) => {
				querySnapshot.value = data
			},
		})
		onCleanup(unsubscribe)
	})

	return querySnapshot
}
