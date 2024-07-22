import { nanoid } from 'nanoid'
import { Replicache } from 'replicache'
import { nonEmpty, object, parse, pipe, string } from 'valibot'

export default defineNuxtPlugin(() => {
	const runtimeSchema = object({
		replicacheLicense: pipe(string(), nonEmpty('replicacheLicense is required.')),
	})
	const { replicacheLicense: licenseKey } = parse(runtimeSchema, useRuntimeConfig().public)
	const userId = useLocalStorage('userId', nanoid(6))

	let replicache = createReplicache(userId.value, licenseKey)

	watch(userId, (userId) => {
		replicache = createReplicache(userId, licenseKey)
	})

	return {
		provide: {
			replicache,
		},
	}
})

const createReplicache = (userId: string, licenseKey: string) =>
	new Replicache({
		name: userId,
		licenseKey,
		pullURL: `/api/pull?userId=${userId}`,
		pushURL: `/api/push?userId=${userId}`,
		logLevel: import.meta.dev ? 'debug' : 'info',
	})
