<script lang="ts" setup>
	import { nanoid } from 'nanoid'
	import * as v from 'valibot'
	import { habitSchema } from '~~/shared/habits'

	useHead({ title: 'Create a Habit' })

	const rep = useReplicache()
	const user = useSupabaseUser()

	const days = ref<string[]>([])

	const onSubmit = async (e: Event) => {
		const formData = Object.fromEntries(new FormData(e.target as HTMLFormElement).entries())
		const result = v.safeParse(v.pick(habitSchema, ['name']), formData)
		if (result.success)
			await rep.mutate.createHabit({
				name: result.output.name,
				id: nanoid(),
				userID: user.value.id,
			})
	}
</script>

<template>
	<div>
		<h1>Create a Habit</h1>
		<form @submit.prevent="onSubmit">
			<div class="flex flex-wrap gap-4">
				<fieldset class="min-inline-[min(45ch,100%)] flex flex-grow-2 flex-basis-none flex-col p-block-2 p-inline-0">
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
				<fieldset class="flex flex-grow-1 flex-basis-none flex-col p-block-2 p-inline-0">
					<legend class="p-0 text-4">Schedule</legend>

					<div class="flex flex-col gap-1">
						<p id="days-of-the-week">Days of the week</p>
						<ToggleGroupRoot v-model="days" aria-labelledby="days-of-the-week">
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="Sun">Sun</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="Mon">Mon</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="Tue">Tue</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="Wed">Wed</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="Thurs">Thurs</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="Fri">Fri</ToggleGroupItem>
							<ToggleGroupItem class="data-[state=on]:bg-dark data-[state=on]:text-white" value="Sat">Sat</ToggleGroupItem>
						</ToggleGroupRoot>
					</div>

					<div class="m-bs-2 flex flex-col gap-1">
						<label for="frequency">Frequency</label>
						<select id="frequency">
							<option>Weekly</option>
							<option>Biweekly</option>
						</select>
					</div>
				</fieldset>
			</div>
			<button>Create Habit</button>
		</form>
	</div>
</template>
