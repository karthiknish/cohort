import process from 'node:process'

import { FieldValue } from 'firebase-admin/firestore'

import { adminAuth, adminDb } from '../src/lib/firebase-admin'

async function main() {
  const [, , emailArg] = process.argv
  const email = (emailArg ?? process.env.ADMIN_EMAIL)?.trim().toLowerCase()

  if (!email) {
    console.error('Usage: pnpm ts-node scripts/set-admin-role.ts <email>')
    console.error('       ADMIN_EMAIL=<email> pnpm ts-node scripts/set-admin-role.ts')
    process.exitCode = 1
    return
  }

  try {
    const userRecord = await adminAuth.getUserByEmail(email)

    const existingClaims = (userRecord.customClaims ?? {}) as Record<string, unknown>
    const nextClaims = {
      ...existingClaims,
      role: 'admin',
    }

    await adminAuth.setCustomUserClaims(userRecord.uid, nextClaims)

    await adminDb
      .collection('users')
      .doc(userRecord.uid)
      .set(
        {
          email,
          role: 'admin',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

    console.log(`Set admin role for ${email} (uid: ${userRecord.uid})`)
    console.log('Users must refresh their session to receive updated privileges.')
  } catch (error: unknown) {
    console.error(`Failed to set admin role for ${email}`)
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    process.exitCode = 1
  }
}

void main()
