<script lang="ts" setup>
	import { nanoid } from 'nanoid'
	import { listHabits } from '~~/shared/habits'

	useHead({ title: 'Login' })
	definePageMeta({ layout: 'centered' })

	const rep = useReplicache()

	const userID = useLocalStorage('userID', nanoid())

	const onSubmit = async (e: Event) => {
		const formData = new FormData(e.target as HTMLFormElement)
		;(e.target as HTMLFormElement).reset()
		await rep.mutate.createHabit({
			name: formData.get('name') as string,
			id: nanoid(36),
			userID: userID.value,
		})
	}

	const deleteHabit = (habitID: string) => {
		rep.mutate.deleteHabit(habitID)
	}

	watchEffect(() => console.log(rep))

	const habits = useSubscribe(
		rep,
		async (tx) => {
			const habitList = await listHabits(tx)
			return habitList.sort((a, b) => a.name.localeCompare(b.name))
		},
		{ defaultValue: [] }
	)
</script>

<template>
	<form @submit.prevent="onSubmit">
		<input type="text" name="name" required />
		<button>Submit</button>
	</form>

	<p>Habits:</p>
	<ul>
		<li @click="deleteHabit(habit.id)" v-for="habit of habits" :key="habit.id">
			{{ habit.name }}
		</li>
	</ul>
</template>

<style scoped>
	h1 {
		color: palevioletred;
	}
</style>
