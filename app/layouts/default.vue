<template>
	<div class="app-layout">
		<main class="main-content" id="main-content">
			<slot />
		</main>
	</div>
</template>

<style scoped>
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
