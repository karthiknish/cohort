import { NextResponse } from 'next/server'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

/**
 * GDPR Article 20 - Right to Data Portability
 * Allows users to export all their personal data in a machine-readable format (JSON)
 */
export const GET = createApiHandler(
  {
    rateLimit: 'sensitive',
  },
  async (req, { auth }) => {
  const userId = auth.uid!
  const exportData: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0',
    userId,
  }

  // 1. User profile data
  const userDoc = await adminDb.collection('users').doc(userId).get()
  if (userDoc.exists) {
    const userData = userDoc.data()
    exportData.profile = {
      name: userData?.name ?? null,
      email: userData?.email ?? null,
      phone: userData?.phone ?? null,
      role: userData?.role ?? null,
      avatarUrl: userData?.avatarUrl ?? null,
      createdAt: userData?.createdAt ?? null,
      updatedAt: userData?.updatedAt ?? null,
      preferences: userData?.preferences ?? null,
      notificationSettings: userData?.notificationSettings ?? null,
    }
  }

  // 2. User's clients/workspaces
  const clientsSnapshot = await adminDb
    .collection('clients')
    .where('ownerId', '==', userId)
    .get()

  exportData.clients = clientsSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  })

  // 3. User's projects
  const projectsSnapshot = await adminDb
    .collection('projects')
    .where('ownerId', '==', userId)
    .get()

  exportData.projects = projectsSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      status: data.status,
      clientId: data.clientId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  })

  // 4. User's tasks
  const tasksSnapshot = await adminDb
    .collection('tasks')
    .where('assigneeId', '==', userId)
    .get()

  const ownedTasksSnapshot = await adminDb
    .collection('tasks')
    .where('ownerId', '==', userId)
    .get()

  const taskIds = new Set<string>()
  const allTasks: Record<string, unknown>[] = []

  for (const doc of [...tasksSnapshot.docs, ...ownedTasksSnapshot.docs]) {
    if (!taskIds.has(doc.id)) {
      taskIds.add(doc.id)
      const data = doc.data()
      allTasks.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    }
  }
  exportData.tasks = allTasks

  // 5. User's proposals
  const proposalsSnapshot = await adminDb
    .collection('proposals')
    .where('ownerId', '==', userId)
    .get()

  exportData.proposals = proposalsSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title,
      status: data.status,
      clientId: data.clientId,
      totalAmount: data.totalAmount,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  })

  // 6. User's invoices/finance records
  const invoicesSnapshot = await adminDb
    .collection('invoices')
    .where('ownerId', '==', userId)
    .get()

  exportData.invoices = invoicesSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      invoiceNumber: data.invoiceNumber,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      clientId: data.clientId,
      dueDate: data.dueDate,
      createdAt: data.createdAt,
    }
  })

  // 7. User's collaboration messages
  const messagesSnapshot = await adminDb
    .collection('collaboration_messages')
    .where('senderId', '==', userId)
    .limit(1000)
    .get()

  exportData.messages = messagesSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      channelId: data.channelId,
      content: data.content,
      createdAt: data.createdAt,
      isDeleted: data.isDeleted ?? false,
    }
  })

  // 8. User's notifications
  const notificationsSnapshot = await adminDb
    .collection('notifications')
    .where('userId', '==', userId)
    .limit(500)
    .get()

  exportData.notifications = notificationsSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.read,
      createdAt: data.createdAt,
    }
  })

  // 9. User's activity logs
  const activitySnapshot = await adminDb
    .collection('activity')
    .where('userId', '==', userId)
    .limit(500)
    .get()

  exportData.activityLog = activitySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      timestamp: data.timestamp ?? data.createdAt,
    }
  })

  // Set filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `cohort-data-export-${timestamp}.json`

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
})
