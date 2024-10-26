import { type ExtractTablesWithRelations } from 'drizzle-orm'
import { drizzle, type NodePgQueryResultHKT } from 'drizzle-orm/node-postgres'
import { PgTransaction } from 'drizzle-orm/pg-core'
import * as v from 'valibot'
import * as schema from '~~/shared/db.schema'

export type Tx = ReturnType<typeof useDB>

export type TxTransaction = PgTransaction<NodePgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>

export const useDB = () => {
	const { DATABASE_URL } = v.parse(v.object({ DATABASE_URL: v.pipe(v.string('MISSING DATABASE_URL'), v.nonEmpty()) }), process.env)
	// const client = postgres(DATABASE_URL, { prepare: false })
	const db = drizzle({
		connection: DATABASE_URL,
		schema,
	})
	return db
}
