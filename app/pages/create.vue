<script lang="ts" setup>
	import { nanoid } from 'nanoid'
	import * as v from 'valibot'
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date'

	useHead({ title: 'Create a Habit' })

	const rep = useReplicache()
	const user = useSupabaseUser()

	const days = ref<DailyFrequency[]>([])

	const onSubmit = async (e: Event) => {
		const formData = new FormData(e.target as HTMLFormElement)
		formData.append('dailyFrequency', JSON.stringify(toRaw(days.value)))

		const schema = v.object({
			...v.pick(habitSchema, ['name', 'description', 'weeklyFrequency']).entries,
			dailyFrequency: v.pipe(
				v.string(),
				v.transform((arrStr) => JSON.parse(arrStr)),
				habitSchema.entries.dailyFrequency
			),
		})

		const result = v.safeParse(schema, Object.fromEntries(formData.entries()))
		if (result.success && user.value) {
			const habitId = nanoid()
			const dailyFrequencyValues = toRaw(days.value)
				.map((dF) => dailyFrequencies.enumValues.indexOf(dF))
				.toSorted((a, b) => a - b)

			const habitEvents = dailyFrequencyValues.map((dayOfWeek) => {
				let nextScheduledDate = today(getLocalTimeZone())
				while (nextScheduledDate.toDate(getLocalTimeZone()).getDay() !== dayOfWeek) nextScheduledDate = nextScheduledDate.add({ days: 1 })

				return {
					id: nanoid(),
					userID: user.value!.id,
					habitID: habitId,
					frequency: result.output.weeklyFrequency,
					completed: false,
					completedAt: null,
					scheduledAt: nextScheduledDate.toString(),
				} satisfies HabitEvent
			})

			const todayEvent = habitEvents.find((habitEvent) => habitEvent.scheduledAt === today(getLocalTimeZone()).toString())
			if (todayEvent)
				habitEvents.push({
					...todayEvent,
					id: nanoid(),
					scheduledAt: parseDate(todayEvent.scheduledAt)
						.add({ weeks: todayEvent.frequency === 'biweekly' ? 2 : 1 })
						.toString(),
				})

			await Promise.all([
				rep.mutate.createHabit({
					name: result.output.name,
					id: habitId,
					userID: user.value.id,
					description: result.output.description,
					dailyFrequency: toRaw(days.value),
					weeklyFrequency: result.output.weeklyFrequency,
				}),
				rep.mutate.createHabitEvents(habitEvents),
			])
			navigateTo(`/habits/${habitId}`)
		}
	}
</script>

<template>
	<div>
		<h1>Create a Habit</h1>
		<form class="m-block-6" @submit.prevent="onSubmit">
			<div class="flex flex-wrap gap-6">
				<fieldset class="min-inline-[min(45ch,100%)] flex flex-grow-2 flex-basis-none flex-col p-inline-0">
					<legend class="p-0 text-4">Habit Information</legend>
					<div class="flex flex-col gap-1">
						<label for="name">Name</label>
						<input id="name" required type="text" name="name" />
					</div>

					<div class="m-bs-2 flex flex-col gap-1">
						<label for="description">Description</label>
						<textarea id="description" name="description" class="resize-y"></textarea>
					</div>
				</fieldset>
				<fieldset class="min-inline-[min(25ch,100%)] flex flex-grow-1 flex-basis-none flex-col gap-4 p-block-2 p-inline-0">
					<legend class="p-0 text-4">Schedule</legend>

					<div class="flex flex-col gap-1">
						<label for="weekly-frequency">Frequency</label>
						<select id="weekly-frequency" name="weeklyFrequency" required>
							<option value="" selected disabled>Select Weekly Frequency</option>
							<option v-for="weeklyFrequency of weeklyFrequencies.enumValues" :key="weeklyFrequency" :value="weeklyFrequency">
								{{ weeklyFrequency.charAt(0).toLocaleUpperCase() + weeklyFrequency.slice(1) }}
							</option>
						</select>
					</div>

					<div class="flex flex-col gap-1">
						<p id="days-of-the-week">Days of the week</p>
						<ToggleGroupRoot v-model="days" aria-labelledby="days-of-the-week">
							<ToggleGroupItem
								v-for="dailyFrequency of dailyFrequencies.enumValues"
								:key="dailyFrequency"
								class="data-[state=on]:bg-dark data-[state=on]:text-white"
								:value="dailyFrequency"
							>
								{{ dailyFrequency.charAt(0).toLocaleUpperCase() + dailyFrequency.slice(1) }}
							</ToggleGroupItem>
						</ToggleGroupRoot>
					</div>

					<!-- <div class="flex flex-col gap-1">
						<CalendarRoot v-slot="{ weekDays, grid }" fixed-weeks>
							<CalendarHeader class="flex items-center justify-between">
								<CalendarPrev class="aspect-ratio-square block-8 inline-flex items-center border-transparent bg-transparent text-dark">
									<Icon name="radix-icons:chevron-left" class="block-6 inline-6" />
								</CalendarPrev>
								<CalendarHeading class="fw-medium" />
								<CalendarNext class="aspect-ratio-square block-8 inline-flex items-center border-transparent bg-transparent text-dark">
									<Icon name="radix-icons:chevron-right" class="block-6 inline-6" />
								</CalendarNext>
							</CalendarHeader>
							<div class="flex flex-col">
								<CalendarGrid v-for="month of grid" :key="month.value.toString()" class="inline-full select-none border-collapse">
									<CalendarGridHead>
										<CalendarGridRow class="grid grid-cols-7 inline-full">
											<CalendarHeadCell v-for="day of weekDays" :key="day">
												{{ day }}
											</CalendarHeadCell>
										</CalendarGridRow>
									</CalendarGridHead>
									<CalendarGridBody class="grid">
										<CalendarGridRow v-for="(weekDates, index) of month.rows" :key="`weekDate-${index}`" class="grid grid-cols-7">
											<CalendarCell
												v-for="weekDate of weekDates"
												:key="weekDate.toString()"
												class="relative text-center text-sm"
												:date="weekDate"
											>
												<CalendarCellTrigger
													:day="weekDate"
													:month="month.value"
													class="data-[selected]:!bg-green10 relative m-inline-auto block-8 inline-8 flex items-center justify-center whitespace-nowrap rounded-full text-sm text-black font-normal outline-none data-[unavailable]:pointer-events-none before:absolute before:top-[5px] before:hidden before:h-1 before:w-1 before:rounded-full before:bg-white data-[highlighted]:bg-green5 hover:bg-green5 data-[disabled]:text-black/30 data-[selected]:text-white data-[unavailable]:text-black/30 data-[unavailable]:line-through focus:shadow-[0_0_0_2px] focus:shadow-black data-[today]:before:block data-[today]:before:bg-green9"
												/>
											</CalendarCell>
										</CalendarGridRow>
									</CalendarGridBody>
								</CalendarGrid>
							</div>
						</CalendarRoot>
					</div> -->
				</fieldset>
			</div>
			<button type="submit" class="m-bs-6 inline-block">Create Habit</button>
		</form>
	</div>
</template>
