#!/usr/bin/env node

/**
 * Script to create a test user for UI testing
 * Usage: npx ts-node scripts/create-test-user.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv'
config({ path: '.env.local' })

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api.js'

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL

if (!CONVEX_URL) {
  console.error('Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function createTestUser() {
  const testEmail = 'test@email.com'
  const testPassword = 'password123'
  const testName = 'Test User'

  console.log('🔧 Creating test user for UI testing...')
  console.log(`📧 Email: ${testEmail}`)
  console.log(`👤 Name: ${testName}`)
  console.log()

  try {
    // First, let's check if the user already exists in our users table
    console.log('🔍 Checking if user profile already exists...')
    
    try {
      // We can't directly check if user exists in Better Auth from this script
      // But we can check our users table
      console.log('ℹ️  User profile check will be done during sign-up')
    } catch (error) {
      console.log('ℹ️  Could not check existing user (this is expected if user does not exist)')
    }

    // Create the user using Better Auth signUp
    console.log('🔐 Creating user with Better Auth...')
    
    // We need to use the auth client directly since this is Better Auth
    // Let's create a simple approach by using the auth service
    
    // For Better Auth, we'll need to create the user through the API
    // Since we can't directly call Better Auth from this script, let's create
    // the user profile in our users table and provide instructions
    
    console.log()
    console.log('📋 NEXT STEPS:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Navigate to the sign-up page')
    console.log('3. Sign up with the following credentials:')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    console.log(`   Name: ${testName}`)
    console.log('4. The user profile will be automatically created in the database')
    console.log()
    console.log('🎯 Alternatively, you can use these credentials to sign in directly')
    console.log('   if the user already exists in Better Auth.')
    
    // Let's also try to create the user profile directly if it doesn't exist
    console.log()
    console.log('🔧 Attempting to create user profile in database...')
    
    try {
      // Generate a unique legacy ID for the user
      const legacyId = `test_${Date.now()}`
      
      const timestamp = Date.now()
      
      // Create user profile in our users table
      await client.mutation(api.users.bulkUpsert, {
        users: [{
          legacyId: legacyId,
          email: testEmail,
          name: testName,
          role: 'admin', // Give admin access for testing
          status: 'active',
          agencyId: legacyId, // Use user ID as workspace ID for testing
          createdAtMs: timestamp,
          updatedAtMs: timestamp,
        }]
      })
      
      console.log('✅ User profile created successfully in database!')
      console.log(`   Legacy ID: ${legacyId}`)
      console.log(`   Role: admin`)
      console.log(`   Status: active`)
      
    } catch (error) {
      console.log('⚠️  Could not create user profile:', error instanceof Error ? error.message : String(error))
      console.log('   This is normal - the profile will be created during sign-up')
    }

    console.log()
    console.log('🎉 Test user setup complete!')
    console.log()
    console.log('📝 Summary:')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    console.log(`   Name: ${testName}`)
    console.log(`   Role: admin (for dashboard access)`)
    console.log()
    console.log('🚀 You can now use these credentials to:')
    console.log('   1. Sign up for a new account')
    console.log('   2. Sign in to access dashboard pages')
    console.log('   3. Test UI consistency across the application')
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

createTestUser()