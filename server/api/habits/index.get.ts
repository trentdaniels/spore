import * as v from 'valibot'
import { habitSchema } from '~~/shared/habits'

export default defineEventHandler(async (event) => {
	const user = await ensureUser(event)
	const db = useDB()

	const habits = await db.query.habits.findMany({
		where: (habits, { eq }) => eq(habits.userID, user.id),
		orderBy: (habits, { asc }) => asc(habits.name),
	})

	return v.parseAsync(v.array(habitSchema), habits)
})
