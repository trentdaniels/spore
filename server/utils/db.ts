import { type ExtractTablesWithRelations } from 'drizzle-orm'
import { type PgTransaction } from 'drizzle-orm/pg-core'
import { drizzle, type PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as v from 'valibot'
import * as schema from '~~/shared/db.schema'

export type Tx = ReturnType<typeof useDB>

export type TxTransaction = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>

export const useDB = () => {
	const { DATABASE_URL } = v.parse(v.object({ DATABASE_URL: v.pipe(v.string('MISSING DATABASE_URL'), v.nonEmpty()) }), process.env)
	const db = drizzle(postgres(DATABASE_URL), { schema })
	return db
}
