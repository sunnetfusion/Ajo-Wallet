import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const reqAdminEmail = request.headers.get('x-admin-email') || ''

  if (reqAdminEmail !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { userId } = body || {}

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ kyc_status: 'verified', updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}


