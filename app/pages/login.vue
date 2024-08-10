<script lang="ts" setup>
	useHead({ title: 'Login' })
	definePageMeta({ layout: 'centered' })

	// const rep = useReplicache()
	const client = useSupabaseClient()
	const user = useSupabaseUser()

	watchEffect(() => console.log(user.value))

	// const onSubmit = async (e: Event) => {
	// 	const formData = new FormData(e.target as HTMLFormElement)
	// 	;(e.target as HTMLFormElement).reset()
	// 	await rep.mutate.createHabit({
	// 		name: formData.get('name') as string,
	// 		id: nanoid(36),
	// 		userID: userID.value,
	// 	})
	// }
	const onSubmit = () => {
		client.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: 'http://localhost:3000/confirm',
			},
		})
	}

	// const deleteHabit = (habitID: string) => {
	// 	rep.mutate.deleteHabit(habitID)
	// }

	// const habits = useSubscribe(
	// 	rep,
	// 	async (tx) => {
	// 		const habitList = await listHabits(tx)
	// 		return habitList.sort((a, b) => a.name.localeCompare(b.name))
	// 	},
	// 	{ defaultValue: [] }
	// )
</script>

<template>
	<form @submit.prevent="onSubmit">
		<!-- <input type="text" name="name" required /> -->
		<button>Sign In with Google</button>
	</form>
</template>

<style scoped>
	h1 {
		color: palevioletred;
	}
</style>
