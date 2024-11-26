const authPaths = ['/confirm', '/login']

export default defineNuxtRouteMiddleware((to) => {
	const user = useSupabaseUser()
	if (user.value && authPaths.includes(to.path)) return navigateTo('/')
})
