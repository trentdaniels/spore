<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtErrorBoundary>
			<!-- TODO: Add some UX to this error -->
			<template #error="{ error }">
				<p>Oh no! Something went wrong</p>
				<code>{{ error }}</code>
				<button @click="clearError(error)">Try Again</button>
			</template>

			<NuxtPage />
		</NuxtErrorBoundary>
	</NuxtLayout>
</template>

<script lang="ts" setup>
	// TODO: Put this in a layout that's authorized
	const replicache = useReplicache()

	onUnmounted(() => replicache.close())
</script>

<style scoped>
	div {
		display: block;
		color: black;
		text-align: center;
	}
</style>
