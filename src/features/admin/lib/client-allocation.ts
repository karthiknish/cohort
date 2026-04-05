export type AllocationUser = {
	id: string
	name: string
	email?: string | null
	role: string
	status: string
}

export type AllocationUserRow = {
	_id?: string
	legacyId?: string | null
	name?: string | null
	email?: string | null
	role?: string | null
	status?: string | null
}

export type AllocationClient = {
	id: string
	name: string
	accountManager?: string | null
	teamMembers: Array<{ name: string; role?: string | null }>
}

export type UserClientAllocation = {
	managedClientNames: string[]
	supportingClientNames: string[]
	totalClientNames: string[]
}

export type UnmatchedClientAllocation = {
	clientId: string
	clientName: string
	person: string
	source: 'accountManager' | 'teamMember'
}

function normalizeAllocationValue(value?: string | null) {
	return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function pushUnmatched(
	unmatched: UnmatchedClientAllocation[],
	seenUnmatched: Set<string>,
	item: UnmatchedClientAllocation,
) {
	const normalizedPerson = normalizeAllocationValue(item.person)
	if (!normalizedPerson) return

	const dedupeKey = `${item.clientId}:${normalizedPerson}`
	if (seenUnmatched.has(dedupeKey)) return

	seenUnmatched.add(dedupeKey)
	unmatched.push({ ...item, person: item.person.trim() })
}

export function getAssignableWorkspaceUsers<T extends AllocationUser>(users: T[]) {
	return users
		.filter((user) => user.role !== 'client' && user.status !== 'disabled' && user.status !== 'suspended')
		.sort((a, b) => a.name.localeCompare(b.name))
}

export function normalizeAllocationUsers(rows: AllocationUserRow[]): AllocationUser[] {
	return rows.map((row) => ({
		id: row.legacyId ?? row._id ?? '',
		name: row.name?.trim() || row.email?.trim() || 'Unknown user',
		email: row.email?.trim() || null,
		role: row.role ?? 'team',
		status: row.status ?? 'pending',
	}))
}

export function dedupeClientTeamMembers(
	accountManager: string,
	teamMembers: Array<{ name: string; role?: string }>,
) {
	const deduped = new Map<string, { name: string; role?: string }>()

	;[{ name: accountManager, role: 'Account Manager' }, ...teamMembers]
		.filter((member) => member.name.trim().length > 0)
		.forEach((member) => {
			const key = normalizeAllocationValue(member.name)
			if (!key || deduped.has(key)) return
			deduped.set(key, { name: member.name.trim(), role: member.role?.trim() || undefined })
		})

	return Array.from(deduped.values())
}

export function buildClientAllocationSummary(users: AllocationUser[], clients: AllocationClient[]) {
	const userLookup = new Map<string, AllocationUser>()
	const allocations = new Map<string, { managed: Set<string>; supporting: Set<string>; total: Set<string> }>()
	const unmatched: UnmatchedClientAllocation[] = []
	const seenUnmatched = new Set<string>()

	users.forEach((user) => {
		allocations.set(user.id, { managed: new Set(), supporting: new Set(), total: new Set() })
		for (const key of [normalizeAllocationValue(user.name), normalizeAllocationValue(user.email)]) {
			if (key && !userLookup.has(key)) userLookup.set(key, user)
		}
	})

	clients.forEach((client) => {
		const matchedUserIds = new Set<string>()
		const managerName = normalizeAllocationValue(client.accountManager)
		if (managerName) {
			const manager = userLookup.get(managerName)
			if (manager) {
				allocations.get(manager.id)?.managed.add(client.name)
				allocations.get(manager.id)?.total.add(client.name)
				matchedUserIds.add(manager.id)
			} else {
				pushUnmatched(unmatched, seenUnmatched, {
					clientId: client.id,
					clientName: client.name,
					person: client.accountManager?.trim() ?? '',
					source: 'accountManager',
				})
			}
		}

		client.teamMembers.forEach((member) => {
			const memberName = normalizeAllocationValue(member.name)
			if (!memberName) return

			const user = userLookup.get(memberName)
			if (!user) {
				pushUnmatched(unmatched, seenUnmatched, {
					clientId: client.id,
					clientName: client.name,
					person: member.name.trim(),
					source: 'teamMember',
				})
				return
			}

			allocations.get(user.id)?.supporting.add(client.name)
			allocations.get(user.id)?.total.add(client.name)
			matchedUserIds.add(user.id)
		})

		matchedUserIds.forEach((userId) => {
			allocations.get(userId)?.total.add(client.name)
		})
	})

	const byUserId: Record<string, UserClientAllocation> = {}
	allocations.forEach((value, userId) => {
		byUserId[userId] = {
			managedClientNames: Array.from(value.managed).sort(),
			supportingClientNames: Array.from(value.supporting).sort(),
			totalClientNames: Array.from(value.total).sort(),
		}
	})

	return { byUserId, unmatched }
}

export function filterAllocationClients<T extends AllocationClient>(clients: T[], searchTerm: string) {
	const query = searchTerm.trim().toLowerCase()
	if (!query) return clients

	return clients.filter((client) => {
		const teamText = client.teamMembers.map((member) => `${member.name} ${member.role ?? ''}`).join(' ')
		const haystack = `${client.name} ${client.accountManager ?? ''} ${teamText}`.toLowerCase()
		return haystack.includes(query)
	})
}

export function countUnmatchedClientAllocations(unmatched: UnmatchedClientAllocation[]) {
	return unmatched.reduce<Record<string, number>>((acc, item) => {
		acc[item.clientId] = (acc[item.clientId] ?? 0) + 1
		return acc
	}, {})
}
