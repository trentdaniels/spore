import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/db.schema'

export type Tx = ReturnType<typeof useDB>

export const useDB = () => {
	const db = drizzle(postgres(process.env.DATABASE_URL!, { prepare: false }), { logger: true, schema })
	return db
}
