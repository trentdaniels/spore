import { nanoid } from 'nanoid'
import { Replicache } from 'replicache'
import * as v from 'valibot'

export default defineNuxtPlugin(() => {
	const runtimeSchema = v.object({
		replicacheLicense: v.pipe(v.string(), v.nonEmpty('replicacheLicense is required.')),
	})
	const { replicacheLicense: licenseKey } = v.parse(runtimeSchema, useRuntimeConfig().public)
	const userId = useLocalStorage('userId', nanoid())

	let replicache = createReplicache(userId.value, licenseKey)

	const resetReplicache = async (userId: string) => {
		await replicache.close()
		replicache = createReplicache(userId, licenseKey)
	}

	watch(userId, (userId) => {
		resetReplicache(userId)
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
		pullURL: `/api/pull?userID=${userId}`,
		pushURL: `/api/push?userID=${userId}`,
		logLevel: import.meta.dev ? 'debug' : 'info',
	})
