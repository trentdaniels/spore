<script lang="ts" setup>
	import * as v from 'valibot'
	import { getHabit } from '~~/shared/habits'
	import { useValidatedParams } from '~/utils/route'

	useHead({ title: 'Create a Habit' })

	const rep = useReplicache()
	const habitId = useValidatedParams(v.string(), 'habitId')

	const habit = useSubscribe(rep, async (tx) => {
		return await getHabit(tx, habitId)
	})
</script>

<template>
	<div v-if="habit">
		<h1>{{ habit.name }}</h1>
		<p v-if="habit.description">{{ habit.description }}</p>
	</div>
</template>
