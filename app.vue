<template>
	<div>
		<NuxtRouteAnnouncer />
		<NuxtWelcome />
	</div>
</template>

<script setup lang="ts">
	const hello = ref('hello')
	const error = 0 + null
</script>

<style>
	div {
		display: block;
		color: black;
		text-align: center;
	}
</style>
