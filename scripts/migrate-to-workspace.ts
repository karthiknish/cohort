import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runMigration() {
  console.log('Starting data migration to workspace-scoped collections...');
  
  // Import dynamically after dotenv.config()
  const { adminDb } = await import('../src/lib/firebase-admin');
  const { resolveWorkspaceIdForUser } = await import('../src/lib/workspace');

  async function migrateUserSubcollections(userId: string) {
    const workspaceId = await resolveWorkspaceIdForUser(userId);
    console.log(`Migrating data for user ${userId} to workspace ${workspaceId}...`);

    const subcollections = [
      'proposals',
      'adMetrics',
      'adIntegrations',
      'syncJobs',
      'clients',
      'tasks',
      'collaborationMessages',
      'financeInvoices',
      'financeRevenue',
      'financeCosts',
      'projects'
    ];

    for (const sub of subcollections) {
      const sourceRef = adminDb.collection('users').doc(userId).collection(sub);
      const targetRef = adminDb.collection('workspaces').doc(workspaceId).collection(sub);

      const snapshot = await sourceRef.get();
      if (snapshot.empty) {
        console.log(`  - No ${sub} found for user ${userId}`);
        continue;
      }

      console.log(`  - Migrating ${snapshot.size} documents from ${sub}...`);
      const batch = adminDb.batch();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        batch.set(targetRef.doc(doc.id), {
          ...data,
          migratedFromUser: userId,
          migratedAt: new Date().toISOString(),
        });
      });

      await batch.commit();
      console.log(`  - Successfully migrated ${sub}`);
    }
  }
  
  const usersSnapshot = await adminDb.collection('users').get();
  console.log(`Found ${usersSnapshot.size} users to process.`);

  for (const userDoc of usersSnapshot.docs) {
    try {
      await migrateUserSubcollections(userDoc.id);
    } catch (error) {
      console.error(`Failed to migrate user ${userDoc.id}:`, error);
    }
  }

  console.log('Migration complete!');
}

runMigration().catch(console.error);
