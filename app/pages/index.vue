<script lang="ts" setup>
	import { getLocalTimeZone, isToday, now, parseDate } from '@internationalized/date'
	import { listHabitEvents, type HabitEvent } from '#shared/habitEvents'
	import { listHabits } from '#shared/habits'

	useHead({ title: 'Dashboard' })

	const rep = useReplicache()

	const { data: habitsWithEvents, isLoaded } = useSubscribe(
		rep,
		async (tx) => {
			const [habits, events] = await Promise.all([listHabits(tx), listHabitEvents(tx)])
			const todayEvents = events.filter((event) => isToday(parseDate(event.scheduledAt), getLocalTimeZone()))

			return habits
				.filter((habit) => todayEvents.some((event) => event.habitID === habit.id))
				.map((habit) => {
					const event = todayEvents.find((event) => event.habitID === habit.id)!
					return {
						habit,
						event,
					}
				})
		},
		{ defaultValue: [] }
	)

	const toggleComplete = (isComplete: boolean, habitEvent: HabitEvent) => {
		rep.mutate.updateHabitEvent({
			...habitEvent,
			completedAt: isComplete ? now(getLocalTimeZone()).toAbsoluteString() : null,
			completed: isComplete,
		})
	}
</script>

<template>
	<div>
		<h1>Today's Breakdown</h1>
		<ul class="m-bs-4 flex flex-col gap-2">
			<template v-if="isLoaded && habitsWithEvents">
				<li v-if="!habitsWithEvents.length">
					No new habits to take care of today! Try <NuxtLink to="/create">creating one here</NuxtLink>.
				</li>

				<li
					v-for="habitEvent of habitsWithEvents"
					v-else
					:key="habitEvent.habit.id"
					class="flex flex-col items-start gap-4 b-rd-md bg-light p-block-[min(1rem,16px)] p-inline-[min(1rem,16px)]"
				>
					<NuxtLink class="inline-block text-lg fw-bold decoration-none" :to="`/habits/${habitEvent.habit.id}`">
						{{ habitEvent.habit.name }}
					</NuxtLink>

					<!-- <button Mark as Complete</button> -->
					<Toggle
						v-slot="{ pressed }"
						:pressed="habitEvent.event.completed"
						class="aspect-square flex items-center gap-2 bg-dark p-block-2 p-inline-2 text-light"
						@update:pressed="toggleComplete($event, habitEvent.event)"
					>
						<Icon size="1.25em" :name="pressed ? 'radix-icons:check-circled' : 'radix-icons:circle'">
							{{ pressed ? 'Complete' : 'Mark as Complete' }}
						</Icon>
					</Toggle>
				</li>
			</template>
		</ul>
	</div>
</template>
