export type ClientTeamMember = {
  name: string
  role: string
}

export type ClientRecord = {
  id: string
  name: string
  accountManager: string
  teamMembers: ClientTeamMember[]
  billingEmail: string | null
  stripeCustomerId?: string | null
  lastInvoiceStatus?: string | null
  lastInvoiceAmount?: number | null
  lastInvoiceCurrency?: string | null
  lastInvoiceIssuedAt?: string | null
  lastInvoiceNumber?: string | null
  lastInvoiceUrl?: string | null
  lastInvoicePaidAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}
