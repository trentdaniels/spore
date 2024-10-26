<script lang="ts" setup>
	import * as v from 'valibot'
	import { getHabit } from '~~/shared/habits'
	import { useValidatedParams } from '~/utils/route'
	import { listHabitEvents } from '~~/shared/habitEvents'

	const rep = useReplicache()
	const habitId = useValidatedParams(v.string(), 'habitId')
	const { data: habit, isLoaded } = useSubscribe(rep, async (tx) => {
		const habit = await getHabit(tx, habitId)
		const events = await listHabitEvents(tx)
		return {
			...habit,
			events: events.filter((event) => event.habitID === habitId),
		}
	})

	// TODO: Figure out a way to make this dynamic. On initial navigation to this page, the title renders correctly.
	// Other navigations cannot resolve the habit value name, so we're defaulting to "Habit Details"
	useSeoMeta({
		title: () => 'Habit Details',
	})
</script>

<template>
	<div v-if="habit && isLoaded">
		<header>
			<h1 class="fw-extrabold decoration-underline">{{ habit.name }}</h1>
			<p v-if="habit.description">{{ habit.description }}</p>
		</header>

		<section aria-labelledby="quick-stats">
			<h2 id="quick-stats">Quick Stats</h2>
			<dl class="flex flex-wrap gap-6">
				<div v-if="habit.description" class="flex flex-col items-start">
					<dt>Description</dt>
					<dd>{{ habit.description }}</dd>
				</div>
				<div class="flex flex-col items-start">
					<dt>Next Completion Date</dt>
					<dd v-if="habit.events[0]">{{ habit.events[0].scheduledAt }}</dd>
					<dd v-else>-</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt>Completion Streak</dt>
					<dd>-</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt>Completion Percentage</dt>
					<dd>-</dd>
				</div>
			</dl>
		</section>

		<section aria-labelledby="habit-history">
			<h2 id="habit-history">Schedule</h2>
			<dl class="flex flex-wrap gap-6">
				<div class="flex flex-col items-start">
					<dt>Last Completed</dt>
					<dd>-</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt>Daily Frequency</dt>
					<dd>{{ habit.dailyFrequency.join(', ') }}</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt>Weekly Frequency</dt>
					<dd>{{ habit.weeklyFrequency }}</dd>
				</div>
			</dl>
		</section>
	</div>
</template>
