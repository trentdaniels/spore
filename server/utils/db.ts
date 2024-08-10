import 'dotenv/config'
import { drizzle as _drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/db.schema'

export type Tx = ReturnType<typeof useDrizzleDB>

const drizzleDB = _drizzle(postgres(process.env.DATABASE_URL!, { prepare: false }), { logger: true, schema })

export const useDrizzleDB = () => {
	return drizzleDB
}
