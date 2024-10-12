<script lang="ts" setup>
	import { nanoid } from 'nanoid'
	import * as v from 'valibot'
	import { habitSchema, type DailyFrequency } from '~~/shared/habits'

	useHead({ title: 'Create a Habit' })

	const rep = useReplicache()
	const user = useSupabaseUser()

	const days = ref<DailyFrequency[]>([])

	const onSubmit = async (e: Event) => {
		const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement).entries())
		const result = v.safeParse(v.pick(habitSchema, ['name', 'description', 'weeklyFrequency']), formData)
		if (result.success)
			await rep.mutate.createHabit({
				name: result.output.name,
				id: nanoid(),
				userID: user.value!.id,
				description: result.output.description,
				dailyFrequency: days.value,
				weeklyFrequency: result.output.weeklyFrequency,
			})
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
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="sunday">Sun</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="monday">Mon</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="tuesday">Tue</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="wednesday">Wed</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="thursday">Thurs</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="friday">Fri</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="saturday">Sat</ToggleGroupItem>
						</ToggleGroupRoot>
					</div>

					<div class="flex flex-col gap-1">
						<label for="weekly-frequency">Frequency</label>
						<select id="weekly-frequency" name="weekly-freqency" required>
							<option value="weekly">Weekly</option>
							<option value="biweekly">Biweekly</option>
							<option value="monthly">Monthly</option>
						</select>
					</div>
				</fieldset>
			</div>
			<button type="submit" class="m-bs-6 inline-block">Create Habit</button>
		</form>
	</div>
</template>
