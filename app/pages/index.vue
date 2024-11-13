<script lang="ts" setup>
	import { DateFormatter, getLocalTimeZone, isToday, now, parseDate, today } from '@internationalized/date'
	import { TransitionPresets } from '@vueuse/core'

	useHead({ title: 'Dashboard' })

	const rep = useReplicache()

	const { data: vm, isLoaded } = useSubscribe(rep, async (tx) => {
		const [habits, events] = await Promise.all([listHabits(tx), listHabitEvents(tx)])
		const todayEvents = events.filter((event) => isToday(parseDate(event.scheduledAt), getLocalTimeZone()))

		const todayHabitViewModels = habits
			.filter((habit) => todayEvents.some((event) => event.habitID === habit.id))
			.map((habit) => {
				const event = todayEvents.find((event) => event.habitID === habit.id)!
				return {
					habit,
					event,
				}
			})

		const pastEvents = events.filter((event) => parseDate(event.scheduledAt).compare(today(getLocalTimeZone())) <= 0)
		const completedPastEvents = pastEvents.filter((pastEvents) => pastEvents.completed)

		return {
			totalHabits: habits,
			completionPercentage: completedPastEvents.length ? Math.floor((completedPastEvents.length / pastEvents.length) * 100) : 0,
			totalCompleted: completedPastEvents.length,
			todayHabits: todayHabitViewModels,
		}
	})

	const toggleComplete = (isComplete: boolean, habitEvent: HabitEvent) => {
		rep.mutate.updateHabitEvent({
			...habitEvent,
			completedAt: isComplete ? now(getLocalTimeZone()).toAbsoluteString() : null,
			completed: isComplete,
		})
	}

	const animatedOutput = useTransition([() => vm.value?.completionPercentage ?? 0, () => vm.value?.totalCompleted ?? 0], {
		duration: 500,
		transition: TransitionPresets.easeInOutCubic,
	})

	const animatedComputed = computed(() => {
		const [completionPercentage, totalCompleted] = animatedOutput.value
		return { completionPercentage, totalCompleted }
	})

	const todayFormatted = new DateFormatter(navigator.language).format(today(getLocalTimeZone()).toDate(getLocalTimeZone()))
</script>

<template>
	<div>
		<header>
			<h1 class="text-balance text-2xl">Today's Breakdown</h1>
			<p class="text-4">{{ todayFormatted }}</p>
		</header>
		<template v-if="isLoaded && vm">
			<div class="m-bs-4 flex flex-wrap gap-8">
				<section aria-labelledby="today-habits" class="min-inline-[min(45ch,100%)] flex-grow-2 flex-basis-none">
					<h2 id="today-habits" class="m-be-2 text-2xl">Habits</h2>
					<ul class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-4">
						<li v-if="!vm.todayHabits.length">
							No new habits to take care of today! Try <NuxtLink to="/create">creating one here</NuxtLink>.
						</li>
						<template v-else>
							<li
								v-for="habitEvent of vm.todayHabits"
								:key="habitEvent.habit.id"
								class="flex flex-col items-start gap-4 border-2 border-dark rounded-2xl border-solid bg-light p-block-12 p-inline-[clamp(1rem,0rem+4vi,2.5rem)]"
							>
								<NuxtLink class="inline-block text-balance text-4xl fw-bold decoration-none" :to="`/habits/${habitEvent.habit.id}`">
									{{ habitEvent.habit.name }}
								</NuxtLink>

								<Toggle
									v-slot="{ pressed }"
									:pressed="habitEvent.event.completed"
									class="m-bs-auto flex items-center gap-2 rounded-lg bg-dark p-block-2 p-inline-4 text-size-5 text-light"
									@update:pressed="toggleComplete($event, habitEvent.event)"
								>
									<Icon class="p-block-2 p-inline-2" :name="pressed ? 'radix-icons:check-circled' : 'radix-icons:circle'" />
									Mark as Complete
								</Toggle>
							</li>
							<li
								class="flex flex-col items-start gap-4 border-2 border-dark rounded-2xl border-solid bg-white p-block-12 p-inline-[clamp(1rem,0rem+4vi,2.5rem)]"
							>
								<p class="inline-block text-balance text-4xl fw-bold decoration-none">Add More Habits</p>

								<p><NuxtLink to="/create">Create new habits</NuxtLink> and track them in the dashboard.</p>
							</li>
						</template>
					</ul>
				</section>

				<section class="min-inline-[min(25ch,100%)] flex-grow-1 flex-basis-none gap-4" aria-labelledby="quick-stats">
					<h2 id="quick-stats" class="m-be-2 text-2xl">Quick Stats</h2>
					<div class="grid border-2 border-dark rounded-2xl b-solid bg-light p-block-8 p-inline-[clamp(1rem,0rem+4vi,2.5rem)]">
						<span class="text-5xl font-bold">{{ vm.totalHabits.length }}</span> Active Habits
					</div>
					<div class="grid m-bs-4 border-2 border-dark rounded-2xl b-solid bg-light p-block-8 p-inline-[clamp(1rem,0rem+4vi,2.5rem)]">
						<span class="text-5xl font-bold">{{ animatedComputed.completionPercentage.toFixed() }}%</span> Tasks Completed
					</div>
					<div class="grid m-bs-4 border-2 border-dark rounded-2xl b-solid bg-light p-block-8 p-inline-[clamp(1rem,0rem+4vi,2.5rem)]">
						<span class="text-5xl font-bold">{{ animatedComputed.totalCompleted.toFixed() }}</span> Total Tasks Completed
					</div>
				</section>
			</div>
			<section aria-labelledby="all-habits" class="m-bs-8">
				<h2 id="all-habits" class="m-be-2 text-2xl">All Habits</h2>
				<ul class="grid gap-4">
					<li v-if="!vm.totalHabits.length">You don't have any habits created! Try <NuxtLink to="/create">creating one here</NuxtLink>.</li>
					<li
						v-for="habit of vm.totalHabits.toSorted((a, b) => a.name.localeCompare(b.name))"
						v-else
						:key="habit.id"
						class="flex flex-col items-start border-2 border-dark rounded-2xl border-solid bg-light p-block-4 p-inline-6"
					>
						<NuxtLink class="inline-block text-balance text-size-xl font-bold decoration-none" :to="`/habits/${habit.id}`">
							{{ habit.name }}
						</NuxtLink>
						<p>
							{{
								habit.dailyFrequency
									.toSorted((a, b) => dailyFrequencies.enumValues.indexOf(a) - dailyFrequencies.enumValues.indexOf(b))
									.join(', ')
							}}
						</p>
					</li>
				</ul>
			</section>
		</template>
	</div>
</template>
