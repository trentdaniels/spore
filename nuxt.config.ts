import { fileURLToPath } from 'url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	sourcemap: true,
	compatibilityDate: '2024-10-24',
	future: { compatibilityVersion: 4 },
	devtools: { enabled: true },
	experimental: {
		typedPages: true,
	},
	modules: ['@nuxtjs/supabase', '@nuxt/eslint', '@unocss/nuxt', '@vueuse/nuxt', 'radix-vue/nuxt', '@nuxt/icon'],
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
	alias: {
		'@server': fileURLToPath(new URL('./server', import.meta.url)),
	},
	imports: {
		dirs: ['shared/**'],
	},
	supabase: {
		redirectOptions: {
			login: '/login',
			callback: '/confirm',
			cookieRedirect: true,
		},
	},
})
