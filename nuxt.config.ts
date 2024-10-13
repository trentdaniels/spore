import { fileURLToPath } from 'url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
				compatibilityDate: '2024-04-03',
				future: { compatibilityVersion: 4 },
				devtools: { enabled: true },
				modules: [
				 '@nuxtjs/supabase',
				 '@nuxt/eslint',
				 '@unocss/nuxt',
				 '@vueuse/nuxt',
				 'radix-vue/nuxt',
				 '@nuxt/icon',
				],
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