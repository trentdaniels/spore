import 'dotenv/config'
import { drizzle as _drizzle } from 'drizzle-orm/postgres-js'
import { type H3Event } from 'h3'
import postgres from 'postgres'
import * as schema from '~~/schema/db.schema'

export const drizzleDB = _drizzle(postgres(process.env.DATABASE_URL!), { logger: true, schema })

export const useDrizzleDB = () => {
	return drizzleDB
}

export const useDrizzle = (event: H3Event) => {
	return event.context.drizzle
}
