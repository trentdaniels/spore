import { isClient } from '@vueuse/core'
import type { Reactive } from 'vue'

type Subscribable<Tx> = {
	subscribe: <TData>(query: (tx: Tx) => Promise<TData>, options: { onData: (data: TData) => void }) => () => void
}

type CallState = 'init' | 'loaded'

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
	const callState = shallowRef<CallState>('init')

	watchSyncEffect((onCleanup) => {
		if (!isClient || !r) return
		const unsubscribe = r.subscribe(query, {
			onData: (data) => {
				querySnapshot.value = data
				if (callState.value === 'init') callState.value = 'loaded'
			},
		})
		onCleanup(unsubscribe)
	})

	return {
		isIdle: computed(() => callState.value === 'init'),
		isLoaded: computed(() => callState.value === 'loaded'),
		data: readonly(querySnapshot),
	}
}
