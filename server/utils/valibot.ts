import { type H3Event } from 'h3'
import { parseAsync, type BaseIssue, type BaseSchema } from 'valibot'

export const getValibotQuery = async <TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	event: H3Event,
	schema: TSchema
) => {
	try {
		const query = getQuery(event)
		const parsedQuery = await parseAsync(schema, query)
		return parsedQuery
	} catch (error) {
		throw createBadRequest(error)
	}
}

export const getValibotBody = async <TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(event: H3Event, schema: TSchema) => {
	try {
		const requestBody = await readBody(event)
		const parsedBody = await parseAsync(schema, requestBody)
		return parsedBody
	} catch (error) {
		throw createBadRequest(error)
	}
}

const createBadRequest = (error: unknown) =>
	createError({
		statusCode: 400,
		statusText: 'Bad Request',
		data: error,
	})
