<script lang="ts" setup>
	useHead({ title: 'Login' })
	definePageMeta({ layout: 'centered' })

	const client = useSupabaseClient()

	const onSubmit = () => {
		client.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: 'http://localhost:3000/confirm',
			},
		})
	}
</script>

<template>
	<form @submit.prevent="onSubmit">
		<button>Sign In with Google</button>
	</form>
</template>

<style scoped>
	h1 {
		color: palevioletred;
	}
</style>
