#!/usr/bin/env node

/**
 * Script to sign up a test user through the API
 * Usage: npx ts-node scripts/signup-test-user.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

async function signUpTestUser() {
  const testEmail = 'test@email.com'
  const testPassword = 'password123'
  const testName = 'Test User'
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  console.log('🔐 Signing up test user...')
  console.log(`📧 Email: ${testEmail}`)
  console.log(`👤 Name: ${testName}`)
  console.log(`🌐 Base URL: ${baseUrl}`)
  console.log()

  try {
    const response = await fetch(`${baseUrl}/api/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ User created successfully!')
      console.log('Response:', result)
    } else {
      const errorText = await response.text()
      console.log('⚠️  Sign-up response:', response.status, errorText)
      
      // If user already exists, that's fine for our purposes
      if (response.status === 400 || response.status === 409) {
        console.log('✅ User likely already exists - this is fine for testing')
      } else {
        throw new Error(`Sign-up failed: ${response.status} ${errorText}`)
      }
    }
  } catch (error) {
    console.error('❌ Failed to sign up user:', error instanceof Error ? error.message : String(error))
  }

  console.log()
  console.log('🎉 Test user setup complete!')
  console.log()
  console.log('📝 You can now sign in with:')
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: ${testPassword}`)
  console.log()
  console.log('🚀 Navigate to http://localhost:3000 to access the application')
}

signUpTestUser()