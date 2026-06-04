// POST /api/aura
// Input:  { use_case: string, base_fragrance_id?: string, weather?: string }
// Output: { results: AuraResultItem[] }
//
// Requires: ANTHROPIC_API_KEY in .env.local

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'

type AuraResultItem = {
  id: string
  brand: string
  name: string
  layering_role: string
  similarity_score: number
}

const client = new Anthropic()

const SYSTEM_PROMPT = `You are AURA, Scentral's AI layering advisor and master perfumer.

Given a use case and an optional anchor (base) fragrance, select the best 5–7 fragrances from the collection to build a layering stack for that occasion.

For each recommendation return:
- id: the fragrance's exact ID from the provided list
- brand: exact brand name from the list
- name: exact fragrance name from the list
- layering_role: one of "Anchor", "Modulator", "Top Note", "Signature Layer", "Opening Layer"
- similarity_score: integer 0–100 (harmony with the anchor, or with the use case when no anchor is given)
  85–100 = Exceptional harmony · 70–84 = Strong complement · 55–69 = Works well · 40–54 = Interesting contrast

Scoring guidance by use case:
- Work / Interview: prefer woody, leather, clean musks — subtle projection
- Date / Evening: prefer oriental, floral, warm amber — moderate-to-strong sillage
- Casual / Home: prefer citrus, aromatic, green — light and uplifting
- Gym: prefer citrus, aquatic, ozonic — clean and energising

If an anchor fragrance is given, weight harmony by shared olfactory family and complementary lean (e.g. woody + leather pair well; oriental + floral pair well).

Rules:
- Only use IDs from the provided list — never invent new ones
- Rank results by similarity_score descending
- Return exactly valid JSON, no markdown fences, no preamble

Response format:
{"results":[{"id":"uuid","brand":"Brand","name":"Name","layering_role":"Anchor","similarity_score":87}]}`

function parseJson(text: string) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed
  try {
    return JSON.parse(candidate)
  } catch {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start === -1 || end <= start) throw new Error('No JSON found in response')
    return JSON.parse(candidate.slice(start, end + 1))
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { use_case, base_fragrance_id, weather } = body as {
      use_case?: string
      base_fragrance_id?: string | null
      weather?: string
    }

    if (!use_case) {
      return NextResponse.json({ error: 'use_case is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AURA is not configured. Missing ANTHROPIC_API_KEY.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: fragrances, error: dbError } = await supabase
      .from('fragrances')
      .select('id, brand, name, family, lean, phase, phase_label, projection')
      .order('brand', { ascending: true })

    if (dbError || !fragrances) {
      return NextResponse.json({ error: 'Failed to load fragrance collection' }, { status: 500 })
    }

    const anchor = base_fragrance_id
      ? fragrances.find(f => f.id === base_fragrance_id) ?? null
      : null

    const fragranceList = fragrances
      .map(f =>
        `[${f.id}] ${f.brand} — ${f.name} | Family: ${f.family ?? 'unknown'} | Lean: ${f.lean ?? 'unknown'} | Phase: ${f.phase} (${f.phase_label ?? ''}) | Projection: ${f.projection ?? 'unknown'}`
      )
      .join('\n')

    const anchorDescription = anchor
      ? `${anchor.brand} — ${anchor.name} (Family: ${anchor.family ?? 'unknown'}, Lean: ${anchor.lean ?? 'unknown'}, Phase: ${anchor.phase} ${anchor.phase_label ?? ''})`
      : 'none — AURA selects the full stack'

    const userPrompt = `Use case: ${use_case}
Weather context: ${weather ?? 'not specified'}
Anchor fragrance: ${anchorDescription}

Collection (${fragrances.length} fragrances):
${fragranceList}

Select the best 5–7 fragrances for this use case. Return JSON only.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

    let parsed: { results: AuraResultItem[] }
    try {
      parsed = parseJson(content.text)
    } catch {
      console.error('AURA: failed to parse response:', content.text)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const validIds = new Set(fragrances.map(f => f.id))
    const results = (parsed.results ?? []).filter((r: AuraResultItem) => validIds.has(r.id))

    return NextResponse.json({
      success: true,
      results,
      cache_read_tokens: message.usage.cache_read_input_tokens ?? 0,
      cache_created_tokens: message.usage.cache_creation_input_tokens ?? 0,
    })
  } catch (error) {
    console.error('AURA route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
