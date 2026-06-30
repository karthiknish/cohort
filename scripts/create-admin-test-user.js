#!/usr/bin/env node

/**
 * Comprehensive script to create a test admin user for UI testing
 * This script:
 * 1. Creates the user via Better Auth
 * 2. Verifies user exists in the database
 * 3. Sets admin role in the Convex database
 * 4. Verifies the setup is complete
 * 
 * Usage: node scripts/create-admin-test-user.js
 */

require('dotenv').config({ path: '.env.local' })
const { createAuthClient } = require('better-auth/client')
const { ConvexHttpClient } = require('convex/browser')
const { api } = require('../convex/_generated/api.js')

const TEST_EMAIL = 'test@email.com'
const TEST_PASSWORD = 'password123'
const TEST_NAME = 'Test User'
const TEST_ROLE = 'admin'
const TEST_STATUS = 'active'

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!CONVEX_URL) {
  console.error('Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL')
  process.exit(1)
}

const authClient = createAuthClient({ baseURL: BASE_URL })
const convexClient = new ConvexHttpClient(CONVEX_URL)

async function createTestUser() {
  console.log('🔐 Step 1: Creating test user via Better Auth...')
  console.log(`   Email: ${TEST_EMAIL}`)
  console.log(`   Password: ${TEST_PASSWORD}`)
  console.log(`   Name: ${TEST_NAME}`)
  console.log()

  try {
    const result = await authClient.signUp.email({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME,
    })

    if (result.data) {
      console.log('✅ User created successfully in Better Auth!')
      console.log(`   User ID: ${result.data.user?.id}`)
      console.log(`   Email: ${result.data.user?.email}`)
      return { success: true, userId: result.data.user?.id }
    } else if (result.error) {
      if (result.error.code === 'USER_ALREADY_EXISTS' || result.error.status === 400) {
        console.log('✅ User already exists in Better Auth - proceeding with setup')
        return { success: true, exists: true }
      }
      throw new Error(`Sign-up failed: ${JSON.stringify(result.error)}`)
    }
  } catch (error) {
    console.error('❌ Failed to create user:', error.message)
    throw error
  }
}

async function verifyUserInConvex() {
  console.log()
  console.log('🔍 Step 2: Verifying user in Convex database...')

  try {
    const result = await convexClient.query(api.users.getUserByEmailPublic, {
      email: TEST_EMAIL,
    })

    if (!result.user) {
      console.log('⚠️  User not found in Convex users table yet')
      console.log('   This is expected - the user profile is created on first login')
      console.log('   Attempting to create user profile...')
      
      const legacyId = `test_${Date.now()}`
      const timestamp = Date.now()
      
      await convexClient.mutation(api.users.bulkUpsert, {
        users: [{
          legacyId,
          email: TEST_EMAIL,
          name: TEST_NAME,
          role: TEST_ROLE,
          status: TEST_STATUS,
          agencyId: legacyId,
          createdAtMs: timestamp,
          updatedAtMs: timestamp,
        }]
      })
      
      console.log('✅ User profile created in Convex!')
      return { found: true, user: { ...result.user, legacyId, email: TEST_EMAIL, name: TEST_NAME, role: TEST_ROLE, status: TEST_STATUS } }
    }

    console.log('✅ User found in Convex database!')
    console.log(`   Legacy ID: ${result.user.legacyId}`)
    console.log(`   Email: ${result.user.email}`)
    console.log(`   Name: ${result.user.name}`)
    console.log(`   Role: ${result.user.role}`)
    console.log(`   Status: ${result.user.status}`)
    
    return { found: true, user: result.user }
  } catch (error) {
    console.error('❌ Failed to verify user:', error.message)
    throw error
  }
}

async function setAdminRole() {
  console.log()
  console.log('👑 Step 3: Setting admin role in Convex database...')

  try {
    const result = await convexClient.mutation(api.users.updateUserRoleStatusPublic, {
      email: TEST_EMAIL,
      role: TEST_ROLE,
      status: TEST_STATUS,
    })

    console.log('✅ User role updated successfully!')
    console.log(`   Legacy ID: ${result.legacyId}`)
    console.log(`   Role: ${TEST_ROLE}`)
    console.log(`   Status: ${TEST_STATUS}`)
    
    return result
  } catch (error) {
    if (error.message.includes('User not found')) {
      console.log('⚠️  User profile not found - may need to login first')
      return { needsLogin: true }
    }
    console.error('❌ Failed to set admin role:', error.message)
    throw error
  }
}

async function verifyFinalSetup() {
  console.log()
  console.log('✅ Step 4: Verifying final setup...')

  try {
    const result = await convexClient.query(api.users.getUserByEmailPublic, {
      email: TEST_EMAIL,
    })

    if (!result.user) {
      console.log('❌ User not found in database')
      return { success: false }
    }

    const user = result.user
    console.log('✅ Final user configuration:')
    console.log(`   ID: ${user._id}`)
    console.log(`   Legacy ID: ${user.legacyId}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Status: ${user.status}`)
    console.log(`   Agency ID: ${user.agencyId}`)
    console.log(`   Created: ${user.createdAtMs ? new Date(user.createdAtMs).toLocaleString() : 'Unknown'}`)
    console.log(`   Updated: ${user.updatedAtMs ? new Date(user.updatedAtMs).toLocaleString() : 'Unknown'}`)

    const isAdmin = user.role === 'admin'
    const isActive = user.status === 'active'

    if (isAdmin && isActive) {
      console.log()
      console.log('🎉 SUCCESS! User is configured as an active admin')
      return { success: true, isAdmin, isActive }
    } else {
      console.log()
      console.log(`⚠️  Configuration check:`)
      console.log(`   Admin role: ${isAdmin ? '✅' : '❌'}`)
      console.log(`   Active status: ${isActive ? '✅' : '❌'}`)
      return { success: false, isAdmin, isActive }
    }
  } catch (error) {
    console.error('❌ Failed to verify setup:', error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Creating Test Admin User for UI Testing')
  console.log('==========================================')
  console.log()
  console.log(`🌐 Base URL: ${BASE_URL}`)
  console.log(`📊 Convex URL: ${CONVEX_URL}`)
  console.log()

  try {
    await createTestUser()
    
    const verifyResult = await verifyUserInConvex()
    
    if (verifyResult.found || verifyResult.user) {
      await setAdminRole()
      await verifyFinalSetup()
    }

    console.log()
    console.log('🎉 TEST USER SETUP COMPLETE!')
    console.log('==============================')
    console.log()
    console.log('📋 CREDENTIALS:')
    console.log(`   Email: ${TEST_EMAIL}`)
    console.log(`   Password: ${TEST_PASSWORD}`)
    console.log(`   Role: ${TEST_ROLE}`)
    console.log(`   Name: ${TEST_NAME}`)
    console.log()
    console.log('🚀 READY FOR TESTING!')
    console.log()
    console.log('You can now:')
    console.log('   1. Navigate to http://localhost:3000')
    console.log('   2. Sign in with the credentials above')
    console.log('   3. Access all dashboard and admin pages')
    console.log('   4. Test UI consistency across the application')
    console.log()
    console.log('🔍 VERIFICATION CHECKLIST:')
    console.log('   [ ] User can sign in successfully')
    console.log('   [ ] Dashboard loads without errors')
    console.log('   [ ] Admin pages are accessible')
    console.log('   [ ] Session persists across page refreshes')
    console.log('   [ ] Real-time updates work properly')
    console.log('   [ ] No session sync errors in console')
    console.log()

  } catch (error) {
    console.error()
    console.error('❌ SETUP FAILED:', error.message)
    console.error()
    console.error('💡 TROUBLESHOOTING:')
    console.error('   1. Make sure the dev server is running: npm run dev')
    console.error('   2. Check that CONVEX_URL is set in .env.local')
    console.error('   3. Verify Convex is running: npm run convex:dev')
    console.error('   4. Try running the script again')
    console.error()
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
}

module.exports = {
  createTestUser,
  verifyUserInConvex,
  setAdminRole,
  verifyFinalSetup,
}
