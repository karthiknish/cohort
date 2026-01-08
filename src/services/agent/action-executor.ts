/**
 * Agent Action Executor
 * 
 * Executes operations requested by the AI agent (create costs, tasks, projects, etc.)
 */

import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

// =============================================================================
// TYPES
// =============================================================================

export interface ActionContext {
    auth: { uid: string; email?: string | null; name?: string | null }
    workspace: {
        workspaceId: string
        financeCostsCollection: FirebaseFirestore.CollectionReference
        tasksCollection: FirebaseFirestore.CollectionReference
        projectsCollection: FirebaseFirestore.CollectionReference
        proposalsCollection: FirebaseFirestore.CollectionReference
        messagesCollection: FirebaseFirestore.CollectionReference
        clientsCollection: FirebaseFirestore.CollectionReference
    }
}

export interface ActionResult {
    success: boolean
    message: string
    data?: Record<string, unknown>
    error?: string
    navigateTo?: string // Optional route to navigate after action
}

// =============================================================================
// OPERATION SCHEMAS
// =============================================================================

const createCostSchema = z.object({
    category: z.string().min(1).default('Ad Spend'),
    amount: z.coerce.number().positive(),
    cadence: z.enum(['one-off', 'monthly', 'quarterly', 'annual']).default('monthly'),
    currency: z.string().length(3).toUpperCase().default('USD'),
})

const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().optional(), // ISO date string
    assigneeId: z.string().optional(), // Assign to someone else
    projectId: z.string().optional(),
    clientId: z.string().optional(),
}).strict()

const updateTaskSchema = z.object({
    taskId: z.string().min(1),
    status: z.enum(['todo', 'in-progress', 'done', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    title: z.string().min(1).optional(),
}).strict()

const createProjectSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    clientId: z.string().optional(),
    status: z.enum(['planning', 'active', 'on-hold', 'completed']).default('planning'),
})

const createProposalSchema = z.object({
    clientName: z.string().min(1).max(200),
    companyName: z.string().optional(),
})

const sendMessageSchema = z.object({
    content: z.string().min(1).max(2000),
    channelType: z.enum(['team', 'client', 'project']).default('team'),
    clientId: z.string().optional(),
    projectId: z.string().optional(),
})

const createNoteSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().max(5000).optional(),
})

const addUserToTeamSchema = z.object({
    userId: z.string().min(1).optional(),
    userName: z.string().min(1).optional(),
    userEmail: z.string().email().optional(),
})

// =============================================================================
// OPERATION HANDLERS
// =============================================================================

async function handleCreateCost(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    console.log('[action-executor] handleCreateCost called with params:', params)
    try {
        const validated = createCostSchema.parse(params)
        console.log('[action-executor] Validated:', validated)

        const docRef = context.workspace.financeCostsCollection.doc()
        const timestamp = FieldValue.serverTimestamp()

        console.log('[action-executor] Writing to Firestore, docId:', docRef.id)
        await docRef.set({
            category: validated.category,
            amount: validated.amount,
            cadence: validated.cadence,
            currency: validated.currency,
            workspaceId: context.workspace.workspaceId,
            createdBy: context.auth.uid,
            createdAt: timestamp,
            updatedAt: timestamp,
            clientId: null,
        })
        console.log('[action-executor] Firestore write successful!')

        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: validated.currency,
        }).format(validated.amount)

        return {
            success: true,
            message: `Done! I've added ${formattedAmount} in ${validated.category} to your Finance records (${validated.cadence}).`,
            data: { id: docRef.id, category: validated.category, amount: validated.amount },
            navigateTo: '/dashboard/finance',
        }
    } catch (error) {
        console.error('[action-executor] createCost failed:', error)
        return {
            success: false,
            message: 'I couldn\'t create the expense. Please try again or go to Finance to add it manually.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function handleCreateTask(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    try {
        const validated = createTaskSchema.parse(params)

        const docRef = context.workspace.tasksCollection.doc()
        const timestamp = FieldValue.serverTimestamp()

        await docRef.set({
            title: validated.title,
            description: validated.description || '',
            priority: validated.priority,
            status: 'todo',
            dueDate: validated.dueDate || null,
            workspaceId: context.workspace.workspaceId,
            createdBy: context.auth.uid,
            assigneeId: validated.assigneeId || context.auth.uid,
            projectId: validated.projectId || null,
            clientId: validated.clientId || null,
            createdAt: timestamp,
            updatedAt: timestamp,
        })

        return {
            success: true,
            message: `Done! I've created the task "${validated.title}" with ${validated.priority} priority.`,
            data: { id: docRef.id, title: validated.title, priority: validated.priority },
            navigateTo: '/dashboard/tasks',
        }
    } catch (error) {
        console.error('[action-executor] createTask failed:', error)
        return {
            success: false,
            message: 'I couldn\'t create the task. Please try again or go to Tasks to add it manually.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function handleUpdateTask(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    try {
        const validated = updateTaskSchema.parse(params)

        const taskRef = context.workspace.tasksCollection.doc(validated.taskId)
        const taskSnap = await taskRef.get()

        if (!taskSnap.exists) {
            return {
                success: false,
                message: 'I couldn\'t find that task. Please check the task ID or go to Tasks.',
                error: 'Task not found',
            }
        }

        const updates: Record<string, unknown> = {
            updatedAt: FieldValue.serverTimestamp(),
        }

        if (validated.status) updates.status = validated.status
        if (validated.priority) updates.priority = validated.priority
        if (validated.title) updates.title = validated.title

        await taskRef.update(updates)

        const statusMessage = validated.status
            ? `marked as ${validated.status}`
            : validated.priority
                ? `priority set to ${validated.priority}`
                : 'updated'

        return {
            success: true,
            message: `Done! Task ${statusMessage}.`,
            data: { taskId: validated.taskId, ...updates },
        }
    } catch (error) {
        console.error('[action-executor] updateTask failed:', error)
        return {
            success: false,
            message: 'I couldn\'t update the task. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function handleCreateProject(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    try {
        const validated = createProjectSchema.parse(params)

        const docRef = context.workspace.projectsCollection.doc()
        const timestamp = FieldValue.serverTimestamp()

        await docRef.set({
            name: validated.name,
            description: validated.description || '',
            status: validated.status,
            clientId: validated.clientId || null,
            workspaceId: context.workspace.workspaceId,
            createdBy: context.auth.uid,
            createdAt: timestamp,
            updatedAt: timestamp,
        })

        return {
            success: true,
            message: `Done! I've created the project "${validated.name}".`,
            data: { id: docRef.id, name: validated.name, status: validated.status },
            navigateTo: `/dashboard/projects/${docRef.id}`,
        }
    } catch (error) {
        console.error('[action-executor] createProject failed:', error)
        return {
            success: false,
            message: 'I couldn\'t create the project. Please try again or go to Projects.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function handleCreateProposal(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    try {
        const validated = createProposalSchema.parse(params)

        const docRef = context.workspace.proposalsCollection.doc()
        const timestamp = FieldValue.serverTimestamp()

        await docRef.set({
            ownerId: context.auth.uid,
            status: 'draft',
            stepProgress: 0,
            formData: {
                company: { name: validated.companyName || '', industry: '', size: '', website: '' },
                marketing: {},
                goals: {},
                scope: {},
                timelines: {},
                value: {},
            },
            clientId: null,
            clientName: validated.clientName,
            aiInsights: null,
            aiSuggestions: null,
            pdfUrl: null,
            pptUrl: null,
            createdAt: timestamp,
            updatedAt: timestamp,
            lastAutosaveAt: timestamp,
        })

        return {
            success: true,
            message: `Done! I've started a new proposal draft for "${validated.clientName}". Opening it now...`,
            data: { id: docRef.id, clientName: validated.clientName },
            navigateTo: `/dashboard/proposals/${docRef.id}`,
        }
    } catch (error) {
        console.error('[action-executor] createProposal failed:', error)
        return {
            success: false,
            message: 'I couldn\'t create the proposal. Please try again or go to Proposals.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function handleSendMessage(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    try {
        const validated = sendMessageSchema.parse(params)

        // For team channel, no clientId/projectId needed
        if (validated.channelType === 'client' && !validated.clientId) {
            return {
                success: false,
                message: 'I need to know which client to send the message to. Which client?',
                error: 'Client ID required for client channel',
            }
        }

        if (validated.channelType === 'project' && !validated.projectId) {
            return {
                success: false,
                message: 'I need to know which project to send the message to. Which project?',
                error: 'Project ID required for project channel',
            }
        }

        const docRef = context.workspace.messagesCollection.doc()
        const timestamp = FieldValue.serverTimestamp()

        await docRef.set({
            content: validated.content,
            channelType: validated.channelType,
            clientId: validated.clientId || null,
            projectId: validated.projectId || null,
            authorId: context.auth.uid,
            authorName: context.auth.name || 'Unknown',
            format: 'plaintext',
            attachments: [],
            mentions: [],
            reactions: [],
            workspaceId: context.workspace.workspaceId,
            createdAt: timestamp,
            updatedAt: timestamp,
        })

        const channelName = validated.channelType === 'team'
            ? 'team chat'
            : validated.channelType === 'client'
                ? 'the client channel'
                : 'the project channel'

        return {
            success: true,
            message: `Done! Message sent to ${channelName}.`,
            data: { id: docRef.id },
            navigateTo: '/dashboard/collaboration',
        }
    } catch (error) {
        console.error('[action-executor] sendMessage failed:', error)
        return {
            success: false,
            message: 'I couldn\'t send the message. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function handleCreateNote(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    // Notes are just tasks with a different display
    try {
        const validated = createNoteSchema.parse(params)

        const docRef = context.workspace.tasksCollection.doc()
        const timestamp = FieldValue.serverTimestamp()

        await docRef.set({
            title: validated.title,
            description: validated.content || '',
            priority: 'low',
            status: 'todo',
            isNote: true,
            workspaceId: context.workspace.workspaceId,
            createdBy: context.auth.uid,
            assigneeId: context.auth.uid,
            createdAt: timestamp,
            updatedAt: timestamp,
        })

        return {
            success: true,
            message: `Done! Note "${validated.title}" saved.`,
            data: { id: docRef.id, title: validated.title },
        }
    } catch (error) {
        console.error('[action-executor] createNote failed:', error)
        return {
            success: false,
            message: 'I couldn\'t save the note. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function handleAddUserToTeam(
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    try {
        const validated = addUserToTeamSchema.parse(params)

        if (!validated.userId && !validated.userName && !validated.userEmail) {
            return {
                success: false,
                message: 'I need a user name or email to add them to the team. Could you specify who to add?',
                error: 'No user identifier provided',
            }
        }

        // Import adminDb dynamically to avoid circular dependencies
        const { adminDb } = await import('@/lib/firebase-admin')

        // Try to find the user
        let userDoc: FirebaseFirestore.DocumentSnapshot | null = null
        let userId = validated.userId

        if (!userId) {
            // Search by email first (more precise)
            if (validated.userEmail) {
                const emailQuery = await adminDb
                    .collection('users')
                    .where('email', '==', validated.userEmail.toLowerCase())
                    .limit(1)
                    .get()
                if (!emailQuery.empty) {
                    userDoc = emailQuery.docs[0]
                    userId = userDoc.id
                }
            }

            // If not found, try searching by name
            if (!userId && validated.userName) {
                const nameQuery = await adminDb
                    .collection('users')
                    .where('name', '==', validated.userName)
                    .limit(1)
                    .get()
                if (!nameQuery.empty) {
                    userDoc = nameQuery.docs[0]
                    userId = userDoc.id
                }
            }
        } else {
            userDoc = await adminDb.collection('users').doc(userId).get()
            if (!userDoc.exists) {
                userDoc = null
            }
        }

        if (!userId || !userDoc) {
            const searchTerm = validated.userEmail || validated.userName || validated.userId
            return {
                success: false,
                message: `I couldn't find a user matching "${searchTerm}". Please check the name/email or add them from the Admin Panel.`,
                error: 'User not found',
            }
        }

        const userData = userDoc.data() as Record<string, unknown>
        const userName = (userData.name as string) || (userData.email as string) || 'the user'

        // Check if already in team
        if (userData.agencyId === context.workspace.workspaceId) {
            return {
                success: true,
                message: `${userName} is already a member of your team!`,
                data: { userId, userName },
            }
        }

        // Update the user's agencyId
        await adminDb.collection('users').doc(userId).update({
            agencyId: context.workspace.workspaceId,
            updatedAt: (await import('firebase-admin/firestore')).FieldValue.serverTimestamp(),
        })

        return {
            success: true,
            message: `Done! ${userName} has been added to your team.`,
            data: { userId, userName },
            navigateTo: '/admin/team',
        }
    } catch (error) {
        console.error('[action-executor] addUserToTeam failed:', error)
        return {
            success: false,
            message: 'I couldn\'t add that user to the team. Please try from the Admin Panel.',
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

// =============================================================================
// MAIN EXECUTOR
// =============================================================================

const OPERATION_HANDLERS: Record<
    string,
    (params: Record<string, unknown>, context: ActionContext) => Promise<ActionResult>
> = {
    createCost: handleCreateCost,
    addExpense: handleCreateCost,     // alias
    createTask: handleCreateTask,
    addTask: handleCreateTask,         // alias
    updateTask: handleUpdateTask,
    markTaskDone: async (params, ctx) => handleUpdateTask({ ...params, status: 'done' }, ctx),
    createProject: handleCreateProject,
    addProject: handleCreateProject,   // alias
    createProposal: handleCreateProposal,
    startProposal: handleCreateProposal, // alias
    sendMessage: handleSendMessage,
    postMessage: handleSendMessage,    // alias
    createNote: handleCreateNote,
    saveNote: handleCreateNote,        // alias
    addUserToTeam: handleAddUserToTeam,
    addToTeam: handleAddUserToTeam,    // alias
    inviteUser: handleAddUserToTeam,   // alias
}

export const SUPPORTED_OPERATIONS = Object.keys(OPERATION_HANDLERS)

/**
 * Execute an agent action
 */
export async function executeAgentAction(
    operation: string,
    params: Record<string, unknown>,
    context: ActionContext
): Promise<ActionResult> {
    console.log('[action-executor] executeAgentAction called:', { operation, params })
    const handler = OPERATION_HANDLERS[operation]

    if (!handler) {
        console.warn('[action-executor] Unknown operation:', operation)
        return {
            success: false,
            message: `I don't know how to do "${operation}" yet. I can help with: creating expenses, tasks, projects, proposals, or sending messages.`,
            error: `Unknown operation: ${operation}`,
        }
    }

    console.log('[action-executor] Found handler for:', operation)
    const result = await handler(params, context)
    console.log('[action-executor] Handler result:', result)
    return result
}

/**
 * Build operation documentation for system prompt
 */
export function getOperationsDocumentation(): string {
    return `
## Executable Operations (action: "execute")

When the user wants to CREATE or UPDATE data, use:
{"action": "execute", "operation": "<operation>", "params": {...}, "message": "Confirmation message"}

### Financial Operations
- **createCost**: Add expense to Finance
  Params: { category: string, amount: number, cadence?: "one-off"|"monthly"|"quarterly"|"annual" }
  - Use "one-off" for one-time purchases (equipment, single payments)
  - Use "monthly" for recurring monthly expenses (subscriptions, ad spend)
  Example: "add a one-off $1000 office equipment expense" → {"action": "execute", "operation": "createCost", "params": {"category": "Office Equipment", "amount": 1000, "cadence": "one-off"}, "message": "Done! Added $1,000 one-time Office Equipment expense."}

### Task Operations  
- **createTask**: Create a new task
  Params: { title: string, priority?: "low"|"medium"|"high", description?: string, dueDate?: ISO string }
  Example: "remind me to review proposals" → {"action": "execute", "operation": "createTask", "params": {"title": "Review proposals"}, "message": "Done! Task created."}

- **updateTask**: Update task status/priority
  Params: { taskId: string, status?: "todo"|"in-progress"|"done"|"cancelled", priority?: string }
  Example: "mark task ABC as done" → {"action": "execute", "operation": "updateTask", "params": {"taskId": "ABC", "status": "done"}, "message": "Done!"}

### Project Operations
- **createProject**: Create a new project
  Params: { name: string, description?: string, status?: "planning"|"active"|"on-hold"|"completed" }
  Example: "start new project called Website Redesign" → {"action": "execute", "operation": "createProject", "params": {"name": "Website Redesign"}, "message": "Done! Project created."}

### Proposal Operations
- **createProposal**: Start a new proposal draft
  Params: { clientName: string, companyName?: string }
  Example: "create proposal for Acme Corp" → {"action": "execute", "operation": "createProposal", "params": {"clientName": "Acme Corp"}, "message": "Done! Opening the proposal editor..."}

### Communication Operations
- **sendMessage**: Send a message to team/client/project chat
  Params: { content: string, channelType: "team"|"client"|"project", clientId?: string, projectId?: string }
  Example: "post to team chat: Great work today!" → {"action": "execute", "operation": "sendMessage", "params": {"content": "Great work today!", "channelType": "team"}, "message": "Done! Message sent."}

### Note Operations
- **createNote**: Save a quick note
  Params: { title: string, content?: string }
  Example: "save a note about the meeting" → {"action": "execute", "operation": "createNote", "params": {"title": "Meeting notes"}, "message": "Done! Note saved."}

### Team Management Operations
- **addUserToTeam**: Add a user to the workspace team
  Params: { userName?: string, userEmail?: string }
  Example: "add Deepak to the team" → {"action": "execute", "operation": "addUserToTeam", "params": {"userName": "Deepak"}, "message": "Done! Deepak has been added to your team."}
  Example: "add john@example.com to the team" → {"action": "execute", "operation": "addUserToTeam", "params": {"userEmail": "john@example.com"}, "message": "Done!"}

IMPORTANT: Only use "execute" when the user clearly wants to CREATE, ADD, UPDATE, or SEND something. If unsure, ask for clarification.
`.trim()
}
