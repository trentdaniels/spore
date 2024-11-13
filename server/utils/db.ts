import * as schema from '#shared/utils/db.schema'
import { serverSupabaseSession } from '#supabase/server'
import type { DrizzleConfig, ExtractTablesWithRelations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import type { PgDatabase, PgTransaction } from 'drizzle-orm/pg-core'
import { drizzle, type PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import type { H3Event } from 'h3'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import postgres from 'postgres'
import * as v from 'valibot'

export type Tx = Awaited<ReturnType<typeof useDB>>

export type TxTransaction = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>

type SupabaseToken = {
	iss?: string
	sub?: string
	aud?: string[] | string
	exp?: number
	nbf?: number
	iat?: number
	jti?: string
	role?: string
}

export function createDrizzle<
	TDatabase extends PgDatabase<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>,
	Token extends SupabaseToken = SupabaseToken,
>(token: Token, { admin, client }: { admin: TDatabase; client: TDatabase }) {
	return {
		admin,
		rls: (async (transaction, ...rest) => {
			return await client.transaction(
				async (tx) => {
					// Supabase exposes auth.uid() and auth.jwt()
					// https://supabase.com/docs/guides/database/postgres/row-level-security#helper-functions
					try {
						await tx.execute(sql`
          -- auth.jwt()
          select set_config('request.jwt.claims', '${sql.raw(JSON.stringify(token))}', TRUE);
          -- auth.uid()
          select set_config('request.jwt.claim.sub', '${sql.raw(token.sub ?? '')}', TRUE);
          -- set local role
          set local role ${sql.raw(token.role ?? 'anon')};
          `)
						return await transaction(tx)
					} finally {
						await tx.execute(sql`
            -- reset
            select set_config('request.jwt.claims', NULL, TRUE);
            select set_config('request.jwt.claim.sub', NULL, TRUE);
            reset role;
            `)
					}
				},
				...rest
			)
		}) as typeof client.transaction,
	}
}

const sharedDrizzleConfig = {
	schema,
	casing: 'snake_case',
	logger: true,
} satisfies DrizzleConfig<typeof schema>

const decode = (accessToken: string): JwtPayload & { role: string } => {
	try {
		return jwtDecode(accessToken)
	} catch {
		return { role: 'anon' }
	}
}

export const useDB = async (event: H3Event) => {
	const { DATABASE_URL, ADMIN_DATABASE_URL } = await v.parseAsync(
		v.object({
			DATABASE_URL: v.pipe(v.string('MISSING DATABASE_URL'), v.nonEmpty()),
			ADMIN_DATABASE_URL: v.pipe(v.string('MISSING ADMIN_DATABASE_URL'), v.nonEmpty()),
		}),
		process.env
	)
	const admin = drizzle({
		...sharedDrizzleConfig,
		client: postgres(ADMIN_DATABASE_URL, { prepare: false }),
	})

	const client = drizzle({
		...sharedDrizzleConfig,
		client: postgres(DATABASE_URL, { prepare: false }),
	})

	const session = await serverSupabaseSession(event)

	return createDrizzle(decode(session?.access_token ?? ''), { admin, client })
}
