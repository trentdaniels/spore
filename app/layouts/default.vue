<script setup lang="ts">
	const client = useSupabaseClient()
	const signOut = async () => {
		await client.auth.signOut()
		navigateTo('/login', { replace: true })
	}
</script>

<template>
	<div class="min-block-100% flex flex-col gap-4 px-4">
		<header class="flex gap-2 flex-items-baseline">
			<NuxtLink class="text-size-xl" to="/">Spore</NuxtLink>
			<NuxtLink class="mis-auto" to="/create">Create Habit</NuxtLink>
			<button @click="signOut">Sign Out</button>
		</header>
		<main id="main-content" class="flex-1">
			<slot></slot>
		</main>
	</div>
</template>
