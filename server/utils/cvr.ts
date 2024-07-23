import * as v from 'valibot'

// Domain -> CVREntriees
export type CVR = Record<string, CVREntries>
// RowId -> RowVersion
export type CVREntries = Record<string, number>

export const searchResultSchema = v.object({
	id: v.string(),
	rowVersion: v.number(),
})

export const searchResultListSchema = v.array(searchResultSchema)

export const toCVREntries = <TSearchResult extends v.InferOutput<typeof searchResultSchema>>(results: TSearchResult[]) =>
	results.reduce<CVREntries>((entries, { id, rowVersion }) => {
		entries[id] = rowVersion
		return entries
	}, {})

export type CVRDiff = Record<string, CVRDiffEntry>
export type CVRDiffEntry = {
	puts: string[]
	deletes: string[]
}

export const diffCVR = (baseCVR: CVR, nextCVR: CVR) => {
	const uniqueDomains = [...new Set([...Object.keys(baseCVR), ...Object.keys(nextCVR)])]

	return uniqueDomains.reduce<CVRDiff>((diff, domainName) => {
		const baseEntries = baseCVR[domainName] ?? {}
		const nextEntries = nextCVR[domainName] ?? {}

		diff[domainName] = {
			// Add to puts if there is no previous record or if the next rowVersion is higher than the previous rowVersion
			puts: Object.keys(nextEntries).filter((rowID) => !baseEntries[rowID] || baseEntries[rowID] < nextEntries[rowID]),
			// Add to deletes if entries exists in previous but  not in the next entries
			deletes: Object.keys(baseEntries).filter((rowID) => !nextEntries[rowID]),
		}

		return diff
	}, {})
}

export const isCVRDiffEmpty = (cvrDiff: CVRDiff) =>
	Object.values(cvrDiff).every((entry) => entry.puts.length === 0 && entry.deletes.length === 0)
