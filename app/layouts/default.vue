<script setup lang="ts">
	const client = useSupabaseClient()
	const signOut = async () => {
		await client.auth.signOut()
		navigateTo('/login', { replace: true })
	}
</script>

<template>
	<div class="app-layout">
		<header class="app-header px-4">
			<p class="text-size-xl"><NuxtLink to="/">Spore</NuxtLink></p>
			<button class="sign-out" @click="signOut">Sign Out</button>
		</header>
		<main id="main-content" class="main-content">
			<slot />
		</main>
	</div>
</template>

<style scoped>
	.app-header {
		display: flex;
		place-items: baseline;

		& .sign-out {
			margin-inline-start: auto;
		}
	}

	.app-layout {
		display: flex;
		flex-direction: column;
		gap: min(1rem, 2vmax);
		min-block-size: 100%;
	}

	.main-content {
		flex: 1;
	}
</style>
