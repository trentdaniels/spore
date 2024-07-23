import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config()

export default defineConfig({
	schema: ['./schema/**/*.schema.ts'],
	out: './supabase/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	verbose: process.env.NODE_ENV === 'development',
	strict: true,
})
