import { serverSupabaseUser } from '#supabase/server'
import { type H3Event } from 'h3'

export type User = NonNullable<Awaited<ReturnType<typeof serverSupabaseUser>>>

export const HttpStatusCode = {
	Ok: 200,
	Created: 201,
	BadRequest: 400,
	NotFound: 404,
	Unauthenticated: 401,
	Unauthorized: 403,
	InternalError: 500,
} as const

export const createBadRequestError = (error: unknown) =>
	createError({
		statusCode: HttpStatusCode.BadRequest,
		statusText: 'Bad Request',
		cause: error,
	})

export const createUnauthorizedRequestError = (error?: unknown) =>
	createError({
		statusCode: HttpStatusCode.Unauthorized,
		statusText: 'Unauthorized',
		cause: error,
	})

export const createUnauthenticatedRequestError = (error?: unknown) =>
	createError({
		statusCode: HttpStatusCode.Unauthorized,
		statusText: 'Unauthenticated',
		cause: error,
	})

export const createInternalServerRequestError = (error?: unknown) =>
	createError({
		statusCode: HttpStatusCode.InternalError,
		statusText: 'Internal Servier Error',
		cause: error,
	})

export const ensureUser = async (event: H3Event) => {
	const user = await serverSupabaseUser(event)
	if (!user) throw createUnauthenticatedRequestError()
	return user
}

export const ensureUserOwnsEntity = (user: User, userIdToCompare: string) => {
	if (user.id !== userIdToCompare) throw createUnauthorizedRequestError()
}
