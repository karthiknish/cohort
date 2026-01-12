/**
 * Script to create a client in production
 * Run: npx ts-node scripts/create-client.ts
 */

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL

if (!CONVEX_URL) {
  console.error('Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function createClient() {
  const workspaceId = 'k57ajj75gtkwtwjthr5fd1ehh97z2ceh'
  
  try {
    const result = await client.mutation(api.clients.create, {
      workspaceId,
      name: 'Demo Client',
      accountManager: 'Karthik Nishanth',
      teamMembers: [
        { name: 'Karthik Nishanth', role: 'Account Manager' }
      ],
      billingEmail: 'karthik.nishanth06@gmail.com',
      createdBy: workspaceId,
    })
    
    console.log('✅ Client created successfully:', result)
  } catch (error) {
    console.error('❌ Failed to create client:', error)
  }
}

createClient()
