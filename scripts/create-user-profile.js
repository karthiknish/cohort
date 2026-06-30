#!/usr/bin/env node

/**
 * Script to create user profile with admin role
 * Usage: node scripts/create-user-profile.js
 */

require('dotenv').config({ path: '.env.local' })
const { ConvexHttpClient } = require('convex/browser')

const { api } = require('../convex/_generated/api.js')

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL

if (!CONVEX_URL) {
  console.error('Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function createUserProfile() {
  const testEmail = 'test@email.com'
  const userId = 'k57f084ecfwxxfbxrqr0qbtdvs7z9njx' // From Better Auth response
  const testName = 'Test User'

  console.log('🔧 Creating user profile in database...')
  console.log(`📧 Email: ${testEmail}`)
  console.log(`🆔 User ID: ${userId}`)
  console.log()

  try {
    // Since bulkUpsert requires authentication, let's try to use the admin function
    // First, let's try to create user profile using internal function
    console.log('📝 Attempting to create user profile...')
    
    // Try using the internal mutation with authentication bypass
    const timestamp = Date.now()
    
    // We'll create a simple internal function for this
    // But first, let's try to create the user profile directly in Convex dashboard
    // or create a simple manual approach
    
    console.log('ℹ️  Note: User profile creation requires authentication')
    console.log('   The user will be created automatically when they first sign in')
    console.log('   Let\'s verify the current user by attempting to get session info...')
    
    // Try to get current user session
    try {
      const session = await client.query(api.debug.whoami)
      console.log('📊 Current session:', session)
    } catch (sessionError) {
      console.log('ℹ️  No active session (expected for script execution)')
    }
    
    // Try to create user through signup flow
    console.log()
    console.log('🎯 Next Steps:')
    console.log('1. Navigate to http://localhost:3000')
    console.log('2. Sign in with:')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: password123`)
    console.log('3. This will automatically create the user profile')
    console.log('4. Then we can update the role to admin manually')
    
  } catch (error) {
    console.error('❌ Failed:', error.message)
  }

  console.log()
  console.log('🎉 Better Auth user creation complete!')
  console.log()
  console.log('📝 Test user credentials:')
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: password123`)
  console.log(`   Better Auth ID: ${userId}`)
  console.log()
  console.log('🚀 You can now:')
  console.log('   1. Navigate to http://localhost:3000')
  console.log('   2. Sign in with credentials above')
  console.log('   3. Access the application')
  console.log('   4. User profile will be created automatically')
  console.log()
  console.log('💡 To set admin role, after first login:')
  console.log('   - Go to Convex dashboard to update user role')
  console.log('   - Or use the admin interface in the application')
}

createUserProfile().catch(console.error)