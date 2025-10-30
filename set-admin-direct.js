// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase Admin SDK
const admin = require('firebase-admin');

// Decode the base64 service account key
const serviceAccountKeyBase64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;

if (!serviceAccountKeyBase64) {
  console.error('❌ FIREBASE_ADMIN_PRIVATE_KEY_B64 not found in environment');
  process.exit(1);
}

let serviceAccount;
try {
  const decoded = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(decoded);
  console.log('✅ Service account key decoded successfully');
} catch (error) {
  console.error('❌ Failed to decode service account key:', error.message);
  process.exit(1);
}

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

async function setAdminRole(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid}`);

    const existingClaims = (userRecord.customClaims ?? {}) || {};
    const nextClaims = {
      ...existingClaims,
      role: 'admin',
    };

    await auth.setCustomUserClaims(userRecord.uid, nextClaims);
    console.log('✅ Custom claims updated');

    await db
      .collection('users')
      .doc(userRecord.uid)
      .set(
        {
          email,
          role: 'admin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    console.log('✅ Firestore document updated');

    console.log(`✅ Admin role set for ${email} (uid: ${userRecord.uid})`);
    console.log('ℹ️ Users must refresh their session to receive updated privileges.');
  } catch (error) {
    console.error(`❌ Failed to set admin role for ${email}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Usage: node set-admin-direct.js <email>');
  process.exit(1);
}

setAdminRole(email.trim().toLowerCase());
