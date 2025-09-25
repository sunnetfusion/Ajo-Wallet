import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  const body = await request.json()
  const { groupId, email } = body || {}

  if (!groupId || !email) {
    return NextResponse.json({ error: 'groupId and email required' }, { status: 400 })
  }

  // Find user by email
  const { data: users, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .ilike('id', '%')

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  // We need auth.users by email; use admin auth API
  const { data: userByEmail, error: emailErr } = await supabaseAdmin.auth.admin.listUsers()
  if (emailErr) {
    return NextResponse.json({ error: emailErr.message }, { status: 500 })
  }
  const found = userByEmail.users.find((u) => u.email?.toLowerCase() === String(email).toLowerCase())
  if (!found) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Determine next position
  const { data: members } = await supabaseAdmin
    .from('ajo_members')
    .select('position')
    .eq('group_id', groupId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = members?.[0]?.position ? Number(members[0].position) + 1 : 1

  const { data, error } = await supabaseAdmin
    .from('ajo_members')
    .insert({ group_id: groupId, user_id: found.id, position: nextPosition })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}


