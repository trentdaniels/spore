<script lang="ts" setup>
	import { nanoid } from 'nanoid'
	import { listHabits } from '~~/shared/habits'

	useHead({ title: 'Dashboard' })

	const rep = useReplicache()
	const user = useSupabaseUser()

	const deleteHabit = (habitID: string) => {
		rep.mutate.deleteHabit(habitID)
	}

	const onSubmit = async (e: Event) => {
		const formData = new FormData(e.target as HTMLFormElement)
		;(e.target as HTMLFormElement).reset()
		await rep.mutate.createHabit({
			name: formData.get('name') as string,
			id: nanoid(36),
			userID: user.value.id,
		})
	}

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
	<div>
		<h1>Hello</h1>
		<form @submit.prevent="onSubmit">
			<input type="text" name="name" required />
			<button>Create Habit</button>
		</form>
		<p>Habits:</p>
		<ul>
			<li v-for="habit of habits" :key="habit.id" @click="deleteHabit(habit.id)">
				{{ habit.name }}
			</li>
		</ul>
	</div>
</template>
