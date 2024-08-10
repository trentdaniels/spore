import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config()

export default defineConfig({
	schema: ['./server/database/**/*.schema.ts'],
	out: './server/database/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_DIRECT_URL!,
	},
	verbose: true,
	strict: true,
})
