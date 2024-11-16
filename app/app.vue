<script setup lang="ts">
	const consoleLog = (err: unknown) => {
		debugger
		console.log(JSON.stringify(err, undefined, 2))
	}
</script>
<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtErrorBoundary @error="consoleLog($event)">
			<!-- TODO: Add some UX to this error -->
			<template #error="{ error, clearError }">
				<p>Oh no! Something went wrong</p>
				<pre><code>{{ error }}</code></pre>
				<button @click="clearError">Try Again</button>
			</template>

			<NuxtPage />
		</NuxtErrorBoundary>
	</NuxtLayout>
</template>
