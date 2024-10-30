import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import * as v from 'valibot'

const env = config({ path: '.env.local' })

const { DATABASE_DIRECT_URL } = v.parse(
	v.object({ DATABASE_DIRECT_URL: v.pipe(v.string('MISSING DATABASE_DIRECT_URL'), v.nonEmpty()) }),
	env.parsed
)

export default defineConfig({
	schema: ['./shared/**/*.schema.ts'],
	out: './server/database/migrations',
	dialect: 'postgresql',
	casing: 'snake_case',
	dbCredentials: {
		url: DATABASE_DIRECT_URL,
	},
	verbose: true,
	strict: true,
})
