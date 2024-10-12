import * as v from 'valibot'
type BaseSchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>

export const useValidatedParams = <TSchema extends BaseSchema>(schema: TSchema, paramKey?: string) => {
	const route = useRoute()

	if (paramKey) return v.parse(schema, route.params[paramKey])
	return v.parse(schema, route.params)
}
