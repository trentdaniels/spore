<script lang="ts" setup>
	import * as v from 'valibot'
	import { getLocalTimeZone, isSameDay, parseDate, today } from '@internationalized/date'
	import { useDateFormatter } from 'reka-ui'
	import { isBetweenInclusive, type Matcher } from 'reka-ui/date'
	import { dailyFrequencies } from '#shared/utils/db.schema'

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

	const dateFormatter = useDateFormatter(navigator.language)
	const formatDate = (calendarDate: string) => dateFormatter.custom(parseDate(calendarDate).toDate(getLocalTimeZone()), {})

	const isDateUnavailable: Matcher = (date) => {
		const habitDetails = habit.value
		if (!habitDetails || !isBetweenInclusive(date, parseDate(habitDetails.events.at(0)!.scheduledAt), today(getLocalTimeZone())))
			return false
		return !habitDetails.events.some((event) => isSameDay(parseDate(event.scheduledAt), date))
	}

	// FIXME: Figure out a way to make this dynamic. On initial navigation to this page, the title renders correctly.
	// Other navigations cannot resolve the habit value name, so we're defaulting to "Habit Details"
	useHead({ title: () => 'Habit Details' })
</script>

<template>
	<div v-if="habit && isLoaded">
		<header>
			<h1 class="text-balance text-2xl font-bold">{{ habit.name }}</h1>
		</header>

		<section class="m-bs-4 p-block-2" aria-labelledby="quick-stats">
			<h2 id="quick-stats" class="text-xl">Quick Stats</h2>
			<dl class="grid cols-[repeat(auto-fill,minmax(min(25ch,100%),1fr))] m-bs-2 gap-col-6 gap-row-2">
				<div class="flex flex-col items-start">
					<dt class="font-bold">Description</dt>
					<dd v-if="habit.description">{{ habit.description }}</dd>
					<dd v-else>-</dd>
				</div>
				<div class="flex flex-col items-start">
					<dt class="font-bold">Next Completion Date</dt>
					<dd v-if="habit.nextCompletionDate">
						{{ formatDate(habit.nextCompletionDate) }}
					</dd>
					<dd v-else>-</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt class="font-bold">Completion Percentage</dt>
					<dd>{{ habit.completionPercentage }}%</dd>
				</div>
			</dl>
		</section>

		<section class="m-bs-2 p-block-2" aria-labelledby="habit-schedule">
			<h2 id="habit-schedule" class="text-xl">Schedule</h2>
			<dl class="grid cols-[repeat(auto-fill,minmax(min(25ch,100%),1fr))] m-bs-2 gap-col-6 gap-row-2">
				<div class="flex flex-col items-start">
					<dt class="font-bold">Last Completed</dt>
					<dd v-if="habit.lastCompletedDate">{{ formatDate(habit.lastCompletedDate) }}</dd>
					<dd v-else>-</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt class="font-bold">Daily Frequency</dt>
					<dd>
						<ul class="flex flex-wrap gap-col-2 gap-row-0">
							<li
								v-for="frequency of habit.dailyFrequency.toSorted(
									(a, b) => dailyFrequencies.enumValues.indexOf(a) - dailyFrequencies.enumValues.indexOf(b)
								)"
								:key="frequency"
							>
								{{ frequency }}
							</li>
						</ul>
					</dd>
				</div>

				<div class="flex flex-col items-start">
					<dt class="font-bold">Weekly Frequency</dt>
					<dd>{{ habit.weeklyFrequency }}</dd>
				</div>
			</dl>
		</section>

		<section class="m-bs-2 p-block-2" aria-labelledby="habit-history">
			<h2 id="habit-history" class="text-xl">Completion History</h2>
			<CalendarRoot
				v-slot="{ weekDays, grid }"
				class="m-bs-2 inline-[min(100%,60ch)]"
				fixed-weeks
				readonly
				:min-value="parseDate(habit.events.at(0)!.scheduledAt)"
				:max-value="today(getLocalTimeZone())"
				:is-date-unavailable="isDateUnavailable"
			>
				<CalendarHeader class="flex items-center justify-between">
					<CalendarPrev class="aspect-ratio-square inline-8 inline-flex items-center justify-center border-rd-md bg-transparent">
						<Icon name="gravity-ui:chevron-left" />
					</CalendarPrev>
					<CalendarHeading class="text-sm font-medium" />
					<CalendarNext class="aspect-ratio-square inline-8 inline-flex items-center justify-center border-rd-md bg-transparent">
						<Icon name="gravity-ui:chevron-right" />
					</CalendarNext>
				</CalendarHeader>
				<div class="flex flex-col p-bs-4">
					<CalendarGrid v-for="month of grid" :key="month.value.toString()" class="inline-full select-none border-collapse">
						<CalendarGridHead>
							<CalendarGridRow class="grid grid-cols-7 m-be-4 inline-full">
								<CalendarHeadCell v-for="weekDay of weekDays" :key="weekDay" class="rounded-md text-xs">
									{{ weekDay }}
								</CalendarHeadCell>
							</CalendarGridRow>
						</CalendarGridHead>
						<CalendarGridBody class="grid">
							<CalendarGridRow
								v-for="(weekDates, index) of month.rows"
								:key="`weekDate-${index}`"
								class="grid grid-cols-7 justify-items-center grid-items-start"
							>
								<CalendarCell v-for="weekDate of weekDates" :key="weekDate.toString()" class="text-center text-sm" :date="weekDate">
									<CalendarCellTrigger
										v-slot="{ dayValue }"
										class="inline-8 flex flex-col items-center justify-start gap-1 border-rd-sm p-block-2 text-sm line-height-none [&>*]:shrink-0 data-[today]:bg-black/5 data-[disabled]:text-black/30 data-[unavailable]:text-black/30"
										:day="weekDate"
										:month="month.value"
									>
										{{ dayValue }}
										<template v-if="isBetweenInclusive(weekDate, parseDate(habit.events.at(0)!.scheduledAt), today(getLocalTimeZone()))">
											<Icon
												v-if="!habit.events.some((event) => isSameDay(parseDate(event.scheduledAt), weekDate))"
												name="gravity-ui:minus"
											/>
											<Icon
												v-else-if="habit.events.find((event) => isSameDay(parseDate(event.scheduledAt), weekDate))?.completed"
												class="text-green-7"
												name="gravity-ui:check"
											/>
											<Icon v-else class="text-red-7" name="gravity-ui:xmark" />
										</template>
									</CalendarCellTrigger>
								</CalendarCell>
							</CalendarGridRow>
						</CalendarGridBody>
					</CalendarGrid>
				</div>
			</CalendarRoot>
		</section>
	</div>
	<div v-else-if="isLoaded && !habit">
		Oops! We couldn't find this habit! <NuxtLink class="decoration-underline" to="/">Back to Dashboard</NuxtLink>
	</div>
</template>
