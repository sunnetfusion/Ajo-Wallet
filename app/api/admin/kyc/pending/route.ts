import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const reqAdminEmail = request.headers.get('x-admin-email') || ''

  if (reqAdminEmail !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone, country, kyc_status, updated_at')
    .eq('kyc_status', 'pending')
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}


