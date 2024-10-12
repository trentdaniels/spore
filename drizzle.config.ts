import { defineConfig } from 'drizzle-kit'
import * as v from 'valibot'

const { DATABASE_DIRECT_URL } = v.parse(
	v.object({ DATABASE_DIRECT_URL: v.pipe(v.string('MISSING DATABASE_DIRECT_URL'), v.nonEmpty()) }),
	process.env
)

export default defineConfig({
	schema: ['./shared/**/*.schema.ts'],
	out: './server/database/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: DATABASE_DIRECT_URL,
	},
	verbose: true,
	strict: true,
})
