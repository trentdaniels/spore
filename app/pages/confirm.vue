<script lang="ts" setup>
	const user = useSupabaseUser()

	// Get redirect path from cookies
	const cookieName = useRuntimeConfig().public.supabase.cookieName
	const redirectKey = `${cookieName}-redirect-path`
	const redirectPath = useCookie(redirectKey).value

	watchEffect(() => {
		if (user.value) {
			// Clear cookie
			useCookie(redirectKey).value = null
			// Redirect to path
			return navigateTo(redirectPath || '/')
		}
	})
</script>

<template>
	<h1>Confirm</h1>
</template>
