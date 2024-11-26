<script lang="ts" setup>
	useHead({ title: 'Login' })
	definePageMeta({ layout: 'centered', middleware: 'already-authenticated' })

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
	<div class="grid min-block-[100dvb] place-content-center gap-4 leading-none">
		<h1 class="text-balance text-size-12">Welcome to Spore!</h1>
		<p class="text-pretty text-base">Spore is the app to help <span class="font-bold">YOU</span> track your habits with ease.</p>
		<form @submit.prevent="onSubmit">
			<button class="flex items-center gap-1 border-rd-md border-solid bg-dark p-block-3 p-inline-5 text-size-5 text-light">
				<Icon size="1.25em" name="fe:google" />
				Sign In with Google
			</button>
		</form>
	</div>
</template>
