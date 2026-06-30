#!/usr/bin/env node

/**
 * Script to update user profile in Convex database
 * Usage: node scripts/update-user-profile.js
 */

require('dotenv').config({ path: '.env.local' })
const { ConvexHttpClient } = require('convex/browser')

// Import the Convex API
const { api } = require('../convex/_generated/api.js')

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL

if (!CONVEX_URL) {
  console.error('Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function updateUserProfile() {
  const testEmail = 'test@email.com'
  const userId = 'k57f084ecfwxxfbxrqr0qbtdvs7z9njx' // From Better Auth response
  const testName = 'Test User'

  console.log('🔧 Updating user profile in database...')
  console.log(`📧 Email: ${testEmail}`)
  console.log(`🆔 User ID: ${userId}`)
  console.log()

  try {
    const timestamp = Date.now()
    
    // Create user profile in our users table with admin role
    const result = await client.mutation(api.users.bulkUpsert, {
      users: [{
        legacyId: userId,
        email: testEmail,
        name: testName,
        role: 'admin', // Give admin access for testing
        status: 'active',
        agencyId: userId, // Use user ID as workspace ID for testing
        createdAtMs: timestamp,
        updatedAtMs: timestamp,
      }]
    })
    
    console.log('✅ User profile updated successfully!')
    console.log('Response:', result)
    
    // Verify the user was created
    console.log()
    console.log('🔍 Verifying user profile...')
    
    try {
      const user = await client.query(api.users.getByEmail, { 
        email: testEmail 
      })
      
      console.log('✅ User profile verified:')
      console.log(`   ID: ${user.legacyId}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Agency ID: ${user.agencyId}`)
      
    } catch (verifyError) {
      console.log('⚠️  Could not verify user profile:', verifyError.message)
    }
    
  } catch (error) {
    console.error('❌ Failed to update user profile:', error.message)
    process.exit(1)
  }

  console.log()
  console.log('🎉 User profile setup complete!')
  console.log()
  console.log('📝 Test user credentials:')
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: password123`)
  console.log(`   Role: admin`)
  console.log(`   Status: active`)
  console.log()
  console.log('🚀 You can now:')
  console.log('   1. Navigate to http://localhost:3000')
  console.log('   2. Sign in with the credentials above')
  console.log('   3. Access the dashboard with admin privileges')
  console.log('   4. Test UI consistency across all pages')
}

updateUserProfile().catch(console.error)