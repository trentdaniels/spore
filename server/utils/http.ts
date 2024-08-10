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

export const createBadRequest = (error: unknown) =>
	createError({
		statusCode: HttpStatusCode.BadRequest,
		statusText: 'Bad Request',
		data: error,
	})

export const createUnauthorizedRequest = (error?: unknown) =>
	createError({
		statusCode: HttpStatusCode.Unauthorized,
		statusText: 'Unauthorized',
		data: error,
	})

export const createUnauthenticatedRequest = (error?: unknown) =>
	createError({
		statusCode: HttpStatusCode.Unauthorized,
		statusText: 'Unauthenticated',
		data: error,
	})

export const ensureUser = async (event: H3Event) => {
	const user = await serverSupabaseUser(event)
	if (!user) throw createUnauthenticatedRequest()
	return user
}

export const ensureUserOwnsEntity = (user: User, userIdToCompare: string) => {
	if (user.id !== userIdToCompare) throw createUnauthorizedRequest()
}
