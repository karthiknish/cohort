#!/usr/bin/env node

/**
 * Script to verify test user can sign in
 * Usage: node scripts/verify-test-user.js
 */

require('dotenv').config({ path: '.env.local' })

const { createAuthClient } = require("better-auth/client");

async function verifyTestUser() {
  console.log('🔍 Verifying test user can sign in...')
  
  const testEmail = 'test@email.com'
  const testPassword = 'password123'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  console.log(`📧 Email: ${testEmail}`)
  console.log(`🌐 Base URL: ${baseUrl}`)
  console.log()

  // Create Better Auth client
  const authClient = createAuthClient({
    baseURL: baseUrl,
  });

  try {
    console.log('🔐 Attempting to sign in...')
    
    const result = await authClient.signIn.email({
      email: testEmail,
      password: testPassword,
    });

    if (result.data) {
      console.log('✅ User can sign in successfully!')
      console.log('User data:', {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        emailVerified: result.data.user.emailVerified,
        createdAt: new Date(result.data.user.createdAt).toISOString(),
      })
      
      console.log()
      console.log('🎉 Test user verification PASSED!')
      console.log()
      console.log('📋 Final Summary:')
      console.log(`   Email: ${testEmail}`)
      console.log(`   Password: ${testPassword}`)
      console.log(`   User ID: ${result.data.user.id}`)
      console.log(`   Name: ${result.data.user.name}`)
      console.log(`   Email Verified: ${result.data.user.emailVerified}`)
      console.log()
      console.log('🚀 READY FOR TESTING!')
      console.log('   1. Navigate to http://localhost:3000')
      console.log('   2. Sign in with the credentials above')
      console.log('   3. You will have access to the application')
      console.log('   4. The user profile will be created automatically on first login')
      console.log('   5. You can test UI consistency across all dashboard pages')
      
    } else if (result.error) {
      console.log('❌ Sign-in failed:', result.error)
      console.log()
      console.log('⚠️  Please check:')
      console.log('   1. That the development server is running')
      console.log('   2. That the user was created successfully')
      console.log('   3. That the email and password are correct')
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

verifyTestUser().catch(console.error)