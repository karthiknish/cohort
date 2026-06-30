#!/usr/bin/env node

/**
 * Script to create a test user using Better Auth client
 * Usage: node scripts/create-test-user-better-auth.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { createAuthClient } = require("better-auth/client");

async function createTestUser() {
  console.log('🔐 Creating test user using Better Auth client...')
  
  const testEmail = 'test@email.com'
  const testPassword = 'password123'
  const testName = 'Test User'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  console.log(`📧 Email: ${testEmail}`)
  console.log(`👤 Name: ${testName}`)
  console.log(`🌐 Base URL: ${baseUrl}`)
  console.log()

  // Create Better Auth client
  const authClient = createAuthClient({
    baseURL: baseUrl,
  });

  try {
    console.log('🔐 Attempting to sign up...')
    
    const result = await authClient.signUp.email({
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    if (result.data) {
      console.log('✅ User created successfully!')
      console.log('User data:', result.data)
    } else if (result.error) {
      console.log('⚠️  Sign-up error:', result.error)
      
      // If user already exists, that's fine for our purposes
      if (result.error.code === 'USER_ALREADY_EXISTS' || result.error.status === 400) {
        console.log('✅ User likely already exists - this is fine for testing')
      } else {
        throw new Error(`Sign-up failed: ${JSON.stringify(result.error)}`)
      }
    }
  } catch (error) {
    console.error('❌ Failed to create user:', error.message)
    
    // Check if user already exists by trying to sign in
    console.log('🔍 Checking if user already exists...')
    try {
      const signInResult = await authClient.signIn.email({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInResult.data) {
        console.log('✅ User already exists and can sign in!')
      }
    } catch (signInError) {
      console.log('❌ User does not exist either:', signInError.message)
      return;
    }
  }

  console.log()
  console.log('🎉 Test user setup complete!')
  console.log()
  console.log('📝 You can now sign in with:')
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: ${testPassword}`)
  console.log()
  console.log('🚀 Navigate to http://localhost:3000 to access the application')
  console.log()
  console.log('💡 The user should now be able to:')
  console.log('   1. Sign in to the dashboard')
  console.log('   2. Access UI pages for testing')
  console.log('   3. Have admin privileges if role was set correctly')
}

createTestUser().catch(console.error)