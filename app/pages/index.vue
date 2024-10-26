<script lang="ts" setup>
	import { listHabits } from '~~/shared/habits'

	useHead({ title: 'Dashboard' })

	const rep = useReplicache()

	const { data: habits, isLoaded } = useSubscribe(rep, async (tx) => {
		const habitList = await listHabits(tx)
		return habitList.toSorted((a, b) => a.name.localeCompare(b.name))
	})
</script>

<template>
	<div>
		<h1>Hello</h1>
		<p>Habits:</p>
		<ul class="flex flex-col gap-2">
			<template v-if="isLoaded && habits">
				<li v-if="!habits.length">You don't have any habits! Try <NuxtLink to="/create">creating one here</NuxtLink>.</li>

				<li v-for="habit of habits" v-else :key="habit.id" class="b-rd-md bg-light">
					<NuxtLink
						class="block p-block-[min(1rem,16px)] p-inline-[min(1rem,16px)] text-lg fw-bold decoration-none"
						:to="`/habits/${habit.id}`"
					>
						{{ habit.name }}
					</NuxtLink>
				</li>
			</template>
		</ul>
	</div>
</template>
