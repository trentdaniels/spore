type Subscribable<Tx> = {
	subscribe: <TData>(
		query: (tx: Tx) => Promise<TData>,
		options: { onData: (data: TData) => void; isEqual?: (a: TData, b: TData) => boolean }
	) => () => void
}

export type UseSubscribeOptions<TDefault> = {
	/** Default can already be undefined since it is an unbounded type parameter. */
	default?: TDefault
}

export const useSubscribe = <Tx, TQueryReturn, TDefaultValue>(
	r: Subscribable<Tx>,
	query: (tx: Tx) => Promise<TQueryReturn>,
	options: UseSubscribeOptions<TDefaultValue> = {}
) => {
	if (!r) throw new Error('[useSubscribe]: invalid cache')

	const { default: defaultValue } = options
	const querySnapshot = shallowRef<TQueryReturn | TDefaultValue | null>(defaultValue ?? null)

	let unsubscribe: ReturnType<(typeof r)['subscribe']> = () => null

	onMounted(() => {
		unsubscribe = r.subscribe(query, {
			onData: (data) => {
				querySnapshot.value = data
			},
		})
	})

	onUnmounted(() => {
		unsubscribe()
	})

	return querySnapshot
}
