import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as v from 'valibot'
import * as schema from '../database/db.schema'

export type Tx = ReturnType<typeof useDB>

export const useDB = () => {
	const { DATABASE_URL } = v.parse(v.object({ DATABASE_URL: v.pipe(v.string('MISSING DATABASE_URL'), v.nonEmpty()) }), process.env)
	const db = drizzle(postgres(DATABASE_URL, { prepare: false }), { logger: true, schema })
	return db
}
