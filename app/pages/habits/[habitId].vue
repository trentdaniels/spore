<script lang="ts" setup>
	import * as v from 'valibot'
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date'

	const rep = useReplicache()
	const habitId = useValidatedParams(v.string(), 'habitId')
	const { data: habit, isLoaded } = useSubscribe(rep, async (tx) => {
		const habit = await getHabit(tx, habitId)
		if (!habit) return
		const events = await listHabitEvents(tx)
		const todayDate = today(getLocalTimeZone())
		const sortedEvents = events
			.filter((event) => event.habitID === habitId)
			.toSorted((a, b) => parseDate(a.scheduledAt).compare(parseDate(b.scheduledAt)))
		const completedEvents = sortedEvents.filter((event) => event.completed)
		const completionPercentage = Math.floor(
			(completedEvents.length / sortedEvents.filter((event) => parseDate(event.scheduledAt).compare(todayDate) <= 0).length) * 100
		)

		return {
			...habit,
			events: sortedEvents,
			nextCompletionDate: sortedEvents.find((event) => parseDate(event.scheduledAt).compare(todayDate) >= 0 && !event.completed)
				?.scheduledAt,
			lastCompletedDate: sortedEvents.findLast((event) => event.completed)?.scheduledAt,
			completionPercentage: isNaN(completionPercentage) ? 0 : completionPercentage,
		}
	})

	// TODO: Figure out a way to make this dynamic. On initial navigation to this page, the title renders correctly.
	// Other navigations cannot resolve the habit value name, so we're defaulting to "Habit Details"
	useHead({ title: () => 'Habit Details' })
</script>

<template>
	<div v-if="habit && isLoaded">
		<header>
			<h1 class="fw-extrabold decoration-underline">{{ habit.name }}</h1>
		</header>

		<section aria-labelledby="quick-stats">
			<h2 id="quick-stats">Quick Stats</h2>
			<dl class="flex flex-wrap gap-6">
				<div class="flex flex-col items-start">
					<dt>Description</dt>
					<dd v-if="habit.description">{{ habit.description }}</dd>
					<dd v-else>-</dd>
				</div>
				<div class="flex flex-col items-start">
					<dt>Next Completion Date</dt>
					<dd v-if="habit.nextCompletionDate">{{ habit.nextCompletionDate }}</dd>
					<dd v-else>-</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt>Completion Percentage</dt>
					<dd>{{ habit.completionPercentage }}%</dd>
				</div>
			</dl>
		</section>

		<section aria-labelledby="habit-history">
			<h2 id="habit-history">Schedule</h2>
			<dl class="flex flex-wrap gap-6">
				<div class="flex flex-col items-start">
					<dt>Last Completed</dt>
					<dd v-if="habit.lastCompletedDate">{{ habit.lastCompletedDate }}</dd>
					<dd v-else>-</dd>
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
	<div v-else-if="isLoaded && !habit">Oops! We couldn't find this habit! <NuxtLink to="/">Back to Dashboard</NuxtLink></div>
</template>
