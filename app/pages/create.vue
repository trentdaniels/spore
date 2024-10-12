<script lang="ts" setup>
	import { nanoid } from 'nanoid'
	import * as v from 'valibot'
	import { habitSchema, type DailyFrequency } from '~~/shared/habits'
	import { dailyFrequencies, weeklyFrequencies } from '~~/shared/db.schema'

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
			await rep.mutate.createHabit({
				name: result.output.name,
				id: habitId,
				userID: user.value.id,
				description: result.output.description,
				dailyFrequency: toRaw(days.value),
				weeklyFrequency: result.output.weeklyFrequency,
			})
			await navigateTo(`/habits/${habitId}`)
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
				<fieldset class="min-inline-[min(25ch,100%)] flex flex-grow-1 flex-basis-none flex-col gap-2 p-block-2 p-inline-0">
					<legend class="p-0 text-4">Schedule</legend>

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

					<div class="flex flex-col gap-1">
						<label for="weekly-frequency">Frequency</label>
						<select id="weekly-frequency" name="weeklyFrequency" required>
							<option value="" selected disabled>Select Weekly Frequency</option>
							<option v-for="weeklyFrequency of weeklyFrequencies.enumValues" :key="weeklyFrequency" :value="weeklyFrequency">
								{{ weeklyFrequency.charAt(0).toLocaleUpperCase() + weeklyFrequency.slice(1) }}
							</option>
						</select>
					</div>
				</fieldset>
			</div>
			<button type="submit" class="m-bs-6 inline-block">Create Habit</button>
		</form>
	</div>
</template>
