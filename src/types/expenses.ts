
export type ExpenseCostType =
	| 'fixed'
	| 'variable'
	| 'time'
	| 'milestone'
	| 'reimbursement'
	| 'employee_reimbursement'

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'

export type ExpenseAttachment = {
	name: string
	url: string
	type: string
	size: string
}

export type ExpenseCategory = {
	id: string
	name: string
	code: string | null
	description: string | null
	isActive: boolean
	isSystem: boolean
	sortOrder: number
	createdAt?: string | null
	updatedAt?: string | null
}

export type Vendor = {
	id: string
	name: string
	email: string | null
	phone: string | null
	website: string | null
	notes: string | null
	isActive: boolean
	createdAt?: string | null
	updatedAt?: string | null
}

export type Expense = {
	id: string
	description: string
	amount: number
	currency: string
	costType: ExpenseCostType
	status: ExpenseStatus
	incurredAt: string | null
	categoryId: string | null
	categoryName: string | null
	vendorId: string | null
	vendorName: string | null
	employeeId: string | null
	submittedAt?: string | null
	approvedAt?: string | null
	rejectedAt?: string | null
	decidedBy?: string | null
	decisionNote?: string | null
	attachments: ExpenseAttachment[]
	createdBy: string | null
	createdAt?: string | null
	updatedAt?: string | null
}

export type ExpenseReportRow = {
	employeeId: string
	total: number
	currency: string
	count: number
	byStatus: Record<ExpenseStatus, { total: number; count: number }>
}

export type ExpenseReportResponse = {
	from: string | null
	to: string | null
	rows: ExpenseReportRow[]
}

