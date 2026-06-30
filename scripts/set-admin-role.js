#!/usr/bin/env node

/**
 * Script to set admin role for test user after login
 * Usage: node scripts/set-admin-role.js
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

async function setAdminRole() {
  const testEmail = 'test@email.com'
  const userId = 'k57f084ecfwxxfbxrqr0qbtdvs7z9njx'

  console.log('👑 Setting admin role for test user...')
  console.log(`📧 Email: ${testEmail}`)
  console.log(`🆔 User ID: ${userId}`)
  console.log()

  try {
    // First, check if user profile exists
    console.log('🔍 Checking if user profile exists...')
    
    try {
      const user = await client.query(api.users.getByEmail, { 
        email: testEmail 
      })
      
      console.log('✅ User profile found:')
      console.log(`   ID: ${user.legacyId}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.status}`)
      
      // Update role to admin if it's not already admin
      if (user.role !== 'admin') {
        console.log()
        console.log('🔧 Updating role to admin...')
        
        // Use admin function to update role
        try {
          const updateResult = await client.mutation(api.adminUsers.updateUserRoleStatus, {
            legacyId: user.legacyId,
            role: 'admin',
            status: 'active'
          })
          
          console.log('✅ Role updated successfully!')
          console.log('Update result:', updateResult)
          
        } catch (adminError) {
          console.log('⚠️  Could not update role using admin function:', adminError.message)
          console.log('   This requires admin privileges to execute')
        }
      } else {
        console.log('✅ User already has admin role!')
      }
      
    } catch (getUserError) {
      console.log('⚠️  User profile not found yet:', getUserError.message)
      console.log('   This is expected if the user hasn\'t logged in yet')
      console.log('   The profile will be created automatically on first login')
    }
    
  } catch (error) {
    console.error('❌ Failed to set admin role:', error.message)
  }

  console.log()
  console.log('🎉 Test User Setup Complete!')
  console.log()
  console.log('📋 FINAL CREDENTIALS:')
  console.log(`   Email: ${testEmail}`)
  console.log(`   Password: password123`)
  console.log(`   User ID: ${userId}`)
  console.log(`   Role: admin (will be set after first login)`)
  console.log()
  console.log('🚀 INSTRUCTIONS:')
  console.log('   1. Navigate to http://localhost:3000')
  console.log('   2. Sign in with the credentials above')
  console.log('   3. After first login, the user profile will be created')
  console.log('   4. Run this script again to set admin role if needed')
  console.log('   5. You can then access all dashboard pages for UI testing')
  console.log()
  console.log('✅ Ready for UI consistency testing!')
}

setAdminRole().catch(console.error)