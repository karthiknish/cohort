import { NextRequest, NextResponse } from 'next/server'
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { authenticateRequest, assertAdmin } from '@/lib/server-auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    assertAdmin(auth)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    let q = query(collection(db, 'problemReports'), orderBy('createdAt', 'desc'))
    
    if (status && status !== 'all') {
      q = query(collection(db, 'problemReports'), where('status', '==', status), orderBy('createdAt', 'desc'))
    }

    const snapshot = await getDocs(q)
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ data: reports })
  } catch (error) {
    console.error('Error fetching problem reports:', error)
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Admin'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('required') ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    assertAdmin(auth)

    const { id, ...updates } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing report ID' }, { status: 400 })
    }

    const reportRef = doc(db, 'problemReports', id)
    await updateDoc(reportRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating problem report:', error)
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Admin'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('required') ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    assertAdmin(auth)

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing report ID' }, { status: 400 })
    }

    await deleteDoc(doc(db, 'problemReports', id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting problem report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
