#!/usr/bin/env node

/**
 * Script to manage test user for session synchronization testing
 * Usage: node scripts/manage-test-user.js [delete|create|reset]
 */

require('dotenv').config({ path: '.env.local' })
const { ConvexHttpClient } = require('convex/browser')

const { api, internal } = require('../convex/_generated/api.js')

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL

if (!CONVEX_URL) {
  console.error('Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

const TEST_EMAIL = 'test@email.com'
const TEST_PASSWORD = 'password123'
const TEST_NAME = 'Test User'

async function deleteTestUser() {
  console.log('🗑️  Deleting existing test user...')
  console.log(`📧 Email: ${TEST_EMAIL}`)
  console.log()

  try {
    // Check if user exists in Convex
    const result = await client.query(api.users.getUserByEmailPublic, {
      email: TEST_EMAIL,
    })
    const existingUser = result.user

    if (existingUser) {
      console.log(`📍 Found user in Convex: ${existingUser._id}`)
      console.log(`   Name: ${existingUser.name}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   Status: ${existingUser.status}`)
      console.log(`   Legacy ID: ${existingUser.legacyId}`)
      
      // Note: We can't directly delete from Convex via HTTP client
      // This would need to be done through the dashboard or an internal mutation
      console.log()
      console.log('⚠️  To fully delete the user:')
      console.log('   1. Go to Convex dashboard')
      console.log('   2. Navigate to the users table')
      console.log('   3. Find and delete the user record')
      console.log('   4. Also clear Better Auth sessions if needed')
    } else {
      console.log('✅ No user found in Convex database')
    }

    // Check Better Auth sessions (if accessible)
    console.log()
    console.log('🔍 Checking for Better Auth user data...')
    console.log('   Better Auth data is stored in the Better Auth component tables')
    console.log('   Check the dashboard for auth component tables')

    return { found: !!existingUser, user: existingUser }
  } catch (error) {
    console.error('❌ Failed to check/delete user:', error.message)
    throw error
  }
}

async function createTestUser() {
  console.log('👤 Creating fresh test user...')
  console.log(`📧 Email: ${TEST_EMAIL}`)
  console.log(`🔑 Password: ${TEST_PASSWORD}`)
  console.log(`👤 Name: ${TEST_NAME}`)
  console.log()

  try {
    // First, try to sign up the user through Better Auth
    console.log('🔐 Attempting to create user through Better Auth...')
    
    // This would typically be done through the signup API
    // For now, we'll provide instructions for manual signup
    console.log()
    console.log('📝 Manual signup required:')
    console.log('   1. Navigate to http://localhost:3000/auth/signup')
    console.log(`   2. Enter email: ${TEST_EMAIL}`)
    console.log(`   3. Enter password: ${TEST_PASSWORD}`)
    console.log(`   4. Enter name: ${TEST_NAME}`)
    console.log('   5. Complete the signup process')
    console.log()
    console.log('💡 This will:')
    console.log('   - Create the user in Better Auth')
    console.log('   - Automatically create the user profile in Convex')
    console.log('   - Set up proper session management')

    return { instructions: true }
  } catch (error) {
    console.error('❌ Failed to create user:', error.message)
    throw error
  }
}

async function updateUserRole() {
  console.log('👑 Updating user role to admin...')
  console.log()

  try {
    const result = await client.mutation(api.users.updateUserRoleStatusPublic, {
      email: TEST_EMAIL,
      role: 'admin',
      status: 'active',
    })

    console.log('✅ User role updated successfully!')
    console.log(`   Legacy ID: ${result.legacyId}`)
    console.log(`   Updated User ID: ${result.updatedUserId}`)
    if (result.duplicateCount > 1) {
      console.log(`   ⚠️  Found ${result.duplicateCount} duplicate records`)
    }

    return result
  } catch (error) {
    console.error('❌ Failed to update user role:', error.message)
    throw error
  }
}

async function verifyUser() {
  console.log('🔍 Verifying test user setup...')
  console.log()

  try {
    const result = await client.query(api.users.getUserByEmailPublic, {
      email: TEST_EMAIL,
    })
    const user = result.user

    if (!user) {
      console.log('❌ User not found in database')
      return { found: false }
    }

    console.log('✅ User found in database:')
    console.log(`   ID: ${user._id}`)
    console.log(`   Legacy ID: ${user.legacyId}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Status: ${user.status}`)
    console.log(`   Agency ID: ${user.agencyId}`)
    console.log(`   Created: ${user.createdAtMs ? new Date(user.createdAtMs).toLocaleString() : 'Unknown'}`)
    console.log(`   Updated: ${user.updatedAtMs ? new Date(user.updatedAtMs).toLocaleString() : 'Unknown'}`)

    return { found: true, user }
  } catch (error) {
    console.error('❌ Failed to verify user:', error.message)
    throw error
  }
}

async function testSession() {
  console.log('🧪 Testing session access...')
  console.log()

  try {
    // This would typically be done by making authenticated requests
    console.log('📝 To test session functionality:')
    console.log('   1. Navigate to http://localhost:3000')
    console.log('   2. Sign in with test credentials')
    console.log('   3. Check browser console for any session errors')
    console.log('   4. Navigate to dashboard pages')
    console.log('   5. Verify data loads correctly')
    console.log()
    console.log('🔍 Things to check:')
    console.log('   - User authentication state persists')
    console.log('   - Dashboard loads without session errors')
    console.log('   - Real-time updates work properly')
    console.log('   - No "session expired" or "unauthorized" errors')

    return { instructions: true }
  } catch (error) {
    console.error('❌ Session test failed:', error.message)
    throw error
  }
}

async function main() {
  const command = process.argv[2] || 'help'

  console.log('🚀 Test User Management Script')
  console.log('================================')
  console.log()

  switch (command) {
    case 'delete':
      await deleteTestUser()
      break

    case 'create':
      await createTestUser()
      break

    case 'reset':
      console.log('🔄 Resetting test user...')
      await deleteTestUser()
      console.log()
      await createTestUser()
      break

    case 'verify':
      await verifyUser()
      break

    case 'role':
      await updateUserRole()
      break

    case 'test':
      await testSession()
      break

    case 'full':
      console.log('🎯 Full test user setup process...')
      console.log()
      
      console.log('Step 1: Delete existing user')
      await deleteTestUser()
      console.log()
      
      console.log('Step 2: Create fresh user')
      await createTestUser()
      console.log()
      
      console.log('Step 3: Wait for manual signup completion')
      console.log('⏸️  Press Enter when you have completed the signup process...')
      await new Promise(resolve => process.stdin.once('data', resolve))
      console.log()
      
      console.log('Step 4: Update user role to admin')
      await updateUserRole()
      console.log()
      
      console.log('Step 5: Verify user setup')
      await verifyUser()
      console.log()
      
      console.log('Step 6: Session testing instructions')
      await testSession()
      break

    case 'help':
    default:
      console.log('Usage: node scripts/manage-test-user.js [command]')
      console.log()
      console.log('Commands:')
      console.log('  delete  - Check for and delete existing test user')
      console.log('  create  - Create fresh test user (requires manual signup)')
      console.log('  reset   - Delete existing user and create fresh one')
      console.log('  verify  - Verify user exists in database')
      console.log('  role    - Update user role to admin')
      console.log('  test    - Show session testing instructions')
      console.log('  full    - Complete setup process (interactive)')
      console.log('  help    - Show this help message')
      console.log()
      console.log('Test Credentials:')
      console.log(`  Email: ${TEST_EMAIL}`)
      console.log(`  Password: ${TEST_PASSWORD}`)
      console.log(`  Name: ${TEST_NAME}`)
      break
  }

  console.log()
  console.log('🎉 Script completed!')
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
}

module.exports = {
  deleteTestUser,
  createTestUser,
  updateUserRole,
  verifyUser,
  testSession,
}