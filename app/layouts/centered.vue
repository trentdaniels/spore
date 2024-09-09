<template>
	<main id="main-content" class="centered-layout">
		<slot></slot>
	</main>
</template>

<style scoped>
	.centered-layout {
		max-inline-size: 600px;
		min-block-size: 100%;
		padding-block: 24px;
		padding-inline: 20px;
		margin: auto;
	}
</style>
