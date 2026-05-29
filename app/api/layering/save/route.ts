import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase service key not configured. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY in environment.' }, { status: 501 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // Expect Authorization: Bearer <access_token>
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required. Provide Authorization: Bearer <access_token>' }, { status: 401 })
  }
  const token = authHeader.replace(/^Bearer\s+/i, '')

  // Validate token and fetch user
  try {
    // supabase.auth.getUser accepts an access token and returns the user
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const user = userData.user

    const insertObj: any = {
      base_fragrance_id: body.base_id ?? null,
      top_fragrance_id: body.top_id ?? null,
      combo_json: body.combo ?? null,
      combo_names: body.combo_names ?? null,
      created_by: user.email ?? user.id,
      created_by_id: user.id,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('layering_combinations').insert([insertObj]).select().single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, row: data })
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 })
  }
}
