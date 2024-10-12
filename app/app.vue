<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtErrorBoundary>
			<!-- TODO: Add some UX to this error -->
			<template #error="{ error, clearError }">
				<p>Oh no! Something went wrong</p>
				<code>{{ error }}</code>
				<button @click="clearError">Try Again</button>
			</template>

			<NuxtPage />
		</NuxtErrorBoundary>
	</NuxtLayout>
</template>

<script lang="ts" setup></script>

<style scoped>
	div {
		display: block;
		color: black;
	}
</style>
