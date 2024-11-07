<script lang="ts" setup>
	useHead({ title: 'Login' })
	definePageMeta({ layout: 'centered' })

	const client = useSupabaseClient()
	const location = useBrowserLocation()

	const onSubmit = () => {
		client.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${location.value.origin}/confirm`,
			},
		})
	}
</script>

<template>
	<form @submit.prevent="onSubmit">
		<button>Sign In with Google</button>
	</form>
</template>
