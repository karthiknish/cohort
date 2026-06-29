//#region node_modules/.nitro/vite/services/ssr/assets/client-allocation-BUDT7CTa.js
function normalizeAllocationValue(value) {
	return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}
function pushUnmatched(unmatched, seenUnmatched, item) {
	const normalizedPerson = normalizeAllocationValue(item.person);
	if (!normalizedPerson) return;
	const dedupeKey = `${item.clientId}:${normalizedPerson}`;
	if (seenUnmatched.has(dedupeKey)) return;
	seenUnmatched.add(dedupeKey);
	unmatched.push({
		...item,
		person: item.person.trim()
	});
}
function getAssignableWorkspaceUsers(users) {
	return users.filter((user) => user.role !== "client" && user.status !== "disabled" && user.status !== "suspended").sort((a, b) => a.name.localeCompare(b.name));
}
function normalizeAllocationUsers(rows) {
	return rows.map((row) => ({
		id: row.legacyId ?? row._id ?? "",
		name: row.name?.trim() || row.email?.trim() || "Unknown user",
		email: row.email?.trim() || null,
		role: row.role ?? "team",
		status: row.status ?? "pending"
	}));
}
function dedupeClientTeamMembers(accountManager, teamMembers) {
	const deduped = /* @__PURE__ */ new Map();
	for (const member of [{
		name: accountManager,
		role: "Account Manager"
	}, ...teamMembers]) {
		if (member.name.trim().length === 0) continue;
		const key = normalizeAllocationValue(member.name);
		if (!key || deduped.has(key)) continue;
		deduped.set(key, {
			name: member.name.trim(),
			role: member.role?.trim() || void 0
		});
	}
	return Array.from(deduped.values());
}
function buildClientAllocationSummary(users, clients) {
	const userLookup = /* @__PURE__ */ new Map();
	const allocations = /* @__PURE__ */ new Map();
	const unmatched = [];
	const seenUnmatched = /* @__PURE__ */ new Set();
	users.forEach((user) => {
		allocations.set(user.id, {
			managed: /* @__PURE__ */ new Set(),
			supporting: /* @__PURE__ */ new Set(),
			total: /* @__PURE__ */ new Set()
		});
		for (const key of [normalizeAllocationValue(user.name), normalizeAllocationValue(user.email)]) if (key && !userLookup.has(key)) userLookup.set(key, user);
	});
	clients.forEach((client) => {
		const matchedUserIds = /* @__PURE__ */ new Set();
		const managerName = normalizeAllocationValue(client.accountManager);
		if (managerName) {
			const manager = userLookup.get(managerName);
			if (manager) {
				allocations.get(manager.id)?.managed.add(client.name);
				allocations.get(manager.id)?.total.add(client.name);
				matchedUserIds.add(manager.id);
			} else pushUnmatched(unmatched, seenUnmatched, {
				clientId: client.id,
				clientName: client.name,
				person: client.accountManager?.trim() ?? "",
				source: "accountManager"
			});
		}
		client.teamMembers.forEach((member) => {
			const memberName = normalizeAllocationValue(member.name);
			if (!memberName) return;
			const user = userLookup.get(memberName);
			if (!user) {
				pushUnmatched(unmatched, seenUnmatched, {
					clientId: client.id,
					clientName: client.name,
					person: member.name.trim(),
					source: "teamMember"
				});
				return;
			}
			allocations.get(user.id)?.supporting.add(client.name);
			allocations.get(user.id)?.total.add(client.name);
			matchedUserIds.add(user.id);
		});
		matchedUserIds.forEach((userId) => {
			allocations.get(userId)?.total.add(client.name);
		});
	});
	const byUserId = {};
	allocations.forEach((value, userId) => {
		byUserId[userId] = {
			managedClientNames: Array.from(value.managed).toSorted(),
			supportingClientNames: Array.from(value.supporting).toSorted(),
			totalClientNames: Array.from(value.total).toSorted()
		};
	});
	return {
		byUserId,
		unmatched
	};
}
function filterAllocationClients(clients, searchTerm) {
	const query = searchTerm.trim().toLowerCase();
	if (!query) return clients;
	return clients.filter((client) => {
		const teamText = client.teamMembers.map((member) => `${member.name} ${member.role ?? ""}`).join(" ");
		return `${client.name} ${client.accountManager ?? ""} ${teamText}`.toLowerCase().includes(query);
	});
}
function countUnmatchedClientAllocations(unmatched) {
	return unmatched.reduce((acc, item) => {
		acc[item.clientId] = (acc[item.clientId] ?? 0) + 1;
		return acc;
	}, {});
}
//#endregion
export { getAssignableWorkspaceUsers as a, filterAllocationClients as i, countUnmatchedClientAllocations as n, normalizeAllocationUsers as o, dedupeClientTeamMembers as r, buildClientAllocationSummary as t };
