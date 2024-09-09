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
			id: nanoid(),
			userID: user.value.id,
		})
	}

	const habits = useSubscribe(
		rep,
		async (tx) => {
			const habitList = await listHabits(tx)
			return habitList.toSorted((a, b) => a.name.localeCompare(b.name))
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
		<ul class="flex flex-col gap-2">
			<li v-if="!habits?.length">You don't have any habits! Try <NuxtLink to="/create">creating one here</NuxtLink>.</li>

			<li
				v-for="habit of habits"
				v-else
				:key="habit.id"
				class="bg-emerald px-[min(1rem,16px)] py-[min(1rem,16px)]"
				@click="deleteHabit(habit.id)"
			>
				{{ habit.name }}
			</li>
		</ul>
	</div>
</template>
