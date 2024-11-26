<script lang="ts" setup>
	useHead({ title: 'Confirming Login..' })
	definePageMeta({ layout: 'centered', middleware: 'already-authenticated' })

	// Get redirect path from cookies
	const cookieName = useRuntimeConfig().public.supabase.cookieName
	const redirectKey = `${cookieName}-redirect-path`
	const redirectPath = useCookie(redirectKey).value

	const user = useSupabaseUser()

	watchEffect(() => {
		if (user.value) {
			// Clear cookie
			useCookie(redirectKey).value = null
			// Redirect to path
			return navigateTo(redirectPath || '/')
		}
	})

	useHead({ title: 'Authenticatin Confirmation' })
</script>

<template>
	<div class="grid min-block-[100dvb] place-content-center gap-4 leading-none">
		<h1 class="text-balance text-size-12">Please wait..</h1>
		<p class="text-pretty text-base">Please wait while we confirm your login information. You should be redirected soon.</p>
		<p class="pretty text-base">
			Taking a while to redirect? Try <NuxtLink to="/login" class="text-dark decoration-underline">logging in again.</NuxtLink>
		</p>
	</div>
</template>
