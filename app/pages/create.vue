<script lang="ts" setup>
	import { nanoid } from 'nanoid'
	import * as v from 'valibot'
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
	import { dailyFrequencies, weeklyFrequencies } from '#shared/utils/db.schema'

	useHead({ title: 'Create a Habit' })

	const rep = useReplicache()
	const user = useSupabaseUser()

	// TODO: Implement a toast for success/fail
	const { handleSubmit, isSubmitting } = useForm({
		validationSchema: toTypedSchema(
			v.object({
				name: v.pipe(
					v.optional(habitSchema.entries.name, ''),
					v.nonEmpty('Name is required.'),
					v.trim(),
					v.maxLength(50, 'Name can be no more than 50 characters.')
				),
				description: v.pipe(
					v.nullish(habitSchema.entries.description, ''),
					v.trim(),
					v.maxLength(100, 'Description can be no more than 100 characters.')
				),
				weeklyFrequency: v.pipe(
					v.optional(v.string(), ''),
					v.nonEmpty('Weekly Frequency is required.'),
					v.picklist(habitSchema.entries.weeklyFrequency.options, 'Must be a valid weekly frequency.')
				),
				dailyFrequency: v.pipe(
					v.optional(v.array(v.string()), []),
					v.nonEmpty('Daily Frequency is required.'),
					v.array(v.picklist(habitSchema.entries.dailyFrequency.item.options), 'Must only contain daily frequencies.')
				),
			})
		),
	})

	const onSubmit = handleSubmit(async (values) => {
		if (!user.value || isSubmitting.value) return
		const habitId = nanoid()
		const userId = user.value.id
		const dailyFrequencyValues = values.dailyFrequency.map((dF) => dailyFrequencies.enumValues.indexOf(dF)).toSorted((a, b) => a - b)

		const habitEvents = dailyFrequencyValues.map((dayOfWeek) => {
			let nextScheduledDate = today(getLocalTimeZone())
			while (nextScheduledDate.toDate(getLocalTimeZone()).getDay() !== dayOfWeek) nextScheduledDate = nextScheduledDate.add({ days: 1 })

			return {
				id: nanoid(),
				userID: userId,
				habitID: habitId,
				frequency: values.weeklyFrequency,
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
				name: values.name,
				id: habitId,
				userID: userId,
				description: values.description,
				dailyFrequency: values.dailyFrequency,
				weeklyFrequency: values.weeklyFrequency,
			}),
			rep.mutate.createHabitEvents(habitEvents),
		])
		navigateTo(`/habits/${habitId}`)
	})
</script>

<template>
	<div>
		<header>
			<h1 class="text-balance text-2xl">Create a Habit</h1>
		</header>
		<form class="m-block-6" @submit.prevent="onSubmit">
			<div class="grid gap-8">
				<fieldset class="flex flex-col p-block-0 p-inline-0 [&>*:not(legend)]:m-bs-2">
					<legend class="p-0 text-size-xl font-bold">Basic Information</legend>
					<div class="flex flex-col items-start gap-1">
						<!-- TODO: Improve styling!  -->
						<Field v-slot="{ field, meta }" name="name">
							<label class="text-size-sm" for="name">Name</label>
							<input
								id="name"
								v-bind="field"
								type="text"
								class="inline-[min(100%,65ch)] appearance-none border-1 border-rd p-block-2.5 p-inline-4 leading-tight"
								:aria-describedby="`${field.name}-error-message`"
								:aria-required="meta.required"
								:aria-invalid="!meta.valid && meta.touched"
								maxlength="50"
							/>
							<ErrorMessage :id="`${field.name}-error-message`" class="text-sm" :name="field.name" />
						</Field>
					</div>

					<div class="flex flex-col items-start gap-1">
						<Field v-slot="{ field, meta }" name="description">
							<label class="text-sm" for="description">Description (Optional)</label>
							<!-- TODO: Improve  styling!  -->
							<textarea
								id="description"
								v-bind="field"
								maxlength="100"
								:aria-describedby="`${field.name}-error-message`"
								:aria-required="meta.required"
								:aria-invalid="!meta.valid && meta.touched"
								class="inline-[min(100%,65ch)] resize-y appearance-none border-1 border-rd p-block-2.5 p-inline-4 leading-tight"
							></textarea>
							<ErrorMessage :id="`${field.name}-error-message`" class="text-sm" :name="field.name" />
						</Field>
					</div>
				</fieldset>

				<fieldset class="flex flex-col appearance-none p-block-0 p-inline-0 [&>*:not(legend)]:m-bs-4">
					<legend class="p-0 text-size-xl font-bold">Schedule</legend>

					<div class="[&>*+*]:m-bs-1">
						<Field v-slot="{ field, meta }" name="weeklyFrequency">
							<p id="weekly-frequency" class="text-sm">Weekly Frequency</p>
							<RadioGroupRoot
								v-bind="field"
								aria-labelledby="weekly-frequency"
								:aria-describedby="`${field.name}-error-message`"
								:aria-invalid="!meta.valid && meta.touched"
								:aria-required="meta.required"
								class="[&>*+*]:m-bs-2"
								:name="field.name"
							>
								<div v-for="weeklyFrequency of weeklyFrequencies.enumValues" :key="weeklyFrequency" class="flex items-center">
									<RadioGroupItem
										:id="weeklyFrequency"
										name="weeklyFrequency"
										class="aspect-square inline-[28px] border-1 border-rd-full bg-transparent"
										:value="weeklyFrequency"
									>
										<RadioGroupIndicator
											class="block-full inline-full flex items-center justify-center after:block after:aspect-square after:block-[12px] after:inline-[12px] after:border-rd-full after:bg-dark after:content-['']"
										/>
									</RadioGroupItem>
									<label class="p-is-2" :for="weeklyFrequency">
										{{ weeklyFrequency.charAt(0).toLocaleUpperCase() + weeklyFrequency.slice(1) }}
									</label>
								</div>
							</RadioGroupRoot>
							<ErrorMessage :id="`${field.name}-error-message`" class="text-sm" :name="field.name" />
						</Field>
					</div>

					<div class="[&>*+*]:m-bs-1">
						<!-- TODO: Improve  styling!  -->
						<!-- TODO:
								Open a PR for Reka-UI to separate an id from the name.
								Context: Reka does not currently support the same "name" attribute when building out hidden inputs.
								This would be useful for checkboxes to retrieve values using the native FormData object.
								If we add an "id" property and create support for the same "name" property inside Reka's VisuallyHiddenInput,
								then we can get the best of both worlds for identifiers and names
							 -->
						<Field v-slot="{ field, meta }" name="dailyFrequency">
							<p id="days-of-the-week" class="text-sm">Daily Frequency (Select all that apply.)</p>
							<CheckboxGroupRoot
								v-bind="field"
								role="group"
								required
								:aria-invalid="meta.touched && !meta.valid"
								aria-labelledby="days-of-the-week"
								:aria-describedby="`${field.name}-error-message`"
								class="flex flex-wrap items-center gap-2"
								:name="field.name"
							>
								<CheckboxRoot
									v-for="dailyFrequency of dailyFrequencies.enumValues"
									:id="dailyFrequency"
									:key="dailyFrequency"
									class="aspect-square inline-10.5 border-1 border-rd-full bg-light p-0 text-dark data-[state=checked]:bg-dark data-[state=checked]:text-light"
									:value="dailyFrequency"
									:aria-label="dailyFrequency"
									:title="dailyFrequency"
									:name="field.name"
								>
									{{ dailyFrequency.charAt(0).toLocaleUpperCase() }}
								</CheckboxRoot>
							</CheckboxGroupRoot>
							<ErrorMessage :id="`${field.name}-error-message`" class="text-sm" :name="field.name" />
						</Field>
					</div>
				</fieldset>
			</div>
			<button
				:aria-disabled="isSubmitting"
				type="submit"
				class="m-bs-10 inline-block border-dark border-rd-md b-solid bg-dark p-block-2 p-inline-4 text-light"
			>
				Create Habit
			</button>
		</form>
	</div>
</template>
