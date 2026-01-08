export interface PlanSummary {
    id: string
    name: string
    description: string
    priceId: string
    unitAmount: number | null
    currency: string | null
    interval: string | null
    badge?: string
    features: string[]
    productName: string | null
}

export interface SubscriptionSummary {
    id: string
    status: string
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: string | null
    currentPeriodStart: string | null
    price: {
        id: string
        currency: string | null
        unitAmount: number | null
        interval: string | null
        nickname: string | null
    } | null
    plan: {
        id: string
        name: string
    } | null
    isManagedByApp: boolean
}

export interface InvoiceSummary {
    id: string
    number: string | null
    status: string | null
    amountPaid: number
    total: number
    currency: string | null
    hostedInvoiceUrl: string | null
    invoicePdf: string | null
    createdAt: string | null
}

export interface UpcomingInvoiceSummary {
    amountDue: number
    currency: string | null
    nextPaymentAttempt: string | null
    dueDate: string | null
    status: string | null
}

export interface BillingStatusResponse {
    plans: PlanSummary[]
    subscription: SubscriptionSummary | null
    invoices: InvoiceSummary[]
    upcomingInvoice: UpcomingInvoiceSummary | null
}

export interface NotificationPreferencesResponse {
    whatsappTasks: boolean
    whatsappCollaboration: boolean
    emailAdAlerts: boolean
    emailPerformanceDigest: boolean
    emailTaskActivity: boolean
    phoneNumber: string | null
}
