import type { H3Event } from 'h3'
import type { BaseIssue } from 'valibot'
import * as v from 'valibot'
import { createBadRequestError } from './http'

type BaseSchema = v.BaseSchema<unknown, unknown, BaseIssue<unknown>>

export const getValibotQuery = async <TSchema extends BaseSchema>(event: H3Event, schema: TSchema) => {
	try {
		const query = getQuery(event)
		const parsedQuery = await v.parseAsync(schema, query)
		return parsedQuery
	} catch (error) {
		throw createBadRequestError(error)
	}
}

export const getValibotBody = async <TSchema extends BaseSchema>(event: H3Event, schema: TSchema) => {
	try {
		const requestBody = await readBody(event)
		const parsedBody = await v.parseAsync(schema, requestBody)
		return parsedBody
	} catch (error) {
		throw createBadRequestError(error)
	}
}
