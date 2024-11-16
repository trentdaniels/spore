// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	sourcemap: true,
	compatibilityDate: '2024-11-11',
	future: { compatibilityVersion: 4 },
	devtools: { enabled: true },
	experimental: {
		typedPages: true,
	},
	modules: ['@nuxtjs/supabase', '@nuxt/eslint', '@unocss/nuxt', '@vueuse/nuxt', '@nuxt/icon', 'reka-ui/nuxt', '@vee-validate/nuxt'],
	runtimeConfig: {
		public: {
			replicacheLicense: '',
		},
	},
	app: {
		head: {
			titleTemplate: '%s - Spore',
		},
	},
	css: ['@/assets/styles/main.css'],
	supabase: {
		redirectOptions: {
			login: '/login',
			callback: '/confirm',
			cookieRedirect: true,
		},
	},
})
