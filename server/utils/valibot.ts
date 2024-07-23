import { type H3Event } from 'h3'
import type { BaseIssue, BaseSchema } from 'valibot'
import * as v from 'valibot'

export const getValibotQuery = async <TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	event: H3Event,
	schema: TSchema
) => {
	try {
		const query = getQuery(event)
		const parsedQuery = await v.parseAsync(schema, query)
		return parsedQuery
	} catch (error) {
		throw createBadRequest(error)
	}
}

export const getValibotBody = async <TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(event: H3Event, schema: TSchema) => {
	try {
		const requestBody = await readBody(event)
		const parsedBody = await v.parseAsync(schema, requestBody)
		return parsedBody
	} catch (error) {
		throw createBadRequest(error)
	}
}

const createBadRequest = (error: unknown) =>
	createError({
		statusCode: HttpStatusCode.BadRequest,
		statusText: 'Bad Request',
		data: error,
	})
