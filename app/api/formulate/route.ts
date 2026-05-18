import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

type FormulatePayload = {
  brand_1?: string
  name_1?: string
  phase_1?: string
  family_1?: string
  application_zone_1?: string
  application_method_1?: string
  anosmia_risk_1?: string
  brand_2?: string
  name_2?: string
  phase_2?: string
  family_2?: string
  application_zone_2?: string
  application_method_2?: string
  anosmia_risk_2?: string
  time_of_day?: string
  weather?: string
  occasion?: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const systemPrompt = `You are the core olfactory intelligence engine of Scentral, acting as an expert Solution Architect, Master Perfumer, and Molecular Fragrance Chemist. Your purpose is to act as a highly analytical 'decision engine' and 'personal fragrance operating system' that calculates the precise chemistry, application order, risks, and performance dynamics of layering two distinct fragrances.

CRITICAL OPERATIONAL RULES:
1. RESPONSE FORMAT: You must ONLY output a single, structurally valid JSON object matching the exact schema provided. Do not enclose the JSON in markdown blocks (e.g., do not use \`\`\`json). Absolutely no prose, introductory greetings, concluding remarks, or markdown text outside the JSON object are permitted.
2. APPLICATION PHASE ORDERING: You must analytically determine which fragrance acts as the "Base/Heavy Phase" (typically higher molecular weight, dense orientals, woods, heavy resins) and which acts as the "Top/Modifier Phase" (volatile accords, citruses, light florals). The ordered array \`application_steps\` must strictly reflect this physical ordering (heavy base first, lighter volatile scent layered second).
3. SPECIFIC BODY ZONES: Never provide vague application advice such as "apply to skin" or "spray on pulse points". You must explicitly assign highly focused physical body zones (e.g., "Back of the neck", "Inner wrists", "Chest/Sternum", "Behind the ears").
4. ANOSMIA (SCENT BLINDNESS) ASSESSMENT: Critically evaluate the cumulative olfactory density of the combination. If both fragrances contain high concentrations of heavy synthetic fixatives (e.g., Ambroxan, Iso E Super, heavy musks) or overlap intensely in the same scent family, calculate the olfactory fatigue index. If the risk is high, populate the \`anosmia_warning\` field with precise behavioral mitigation steps. If the risk is low, explicitly return null.
5. PERFORMANCE ESTIMATION: \`predicted_sillage\` must strictly map to one of these exact values: "Beast", "Strong", "Moderate", or "Soft". \`predicted_hours\` must provide a precise expected longevity window based on base-note concentration (e.g., "6-8 hours", "10-12 hours").

REQUIRED JSON OUTPUT SCHEMA:
{
  "combo_names": [string, string, string],
  "application_steps": [
    {
      "step": number,
      "fragrance": string,
      "sprays": number,
      "zone": string,
      "method": string,
      "note": string
    }
  ],
  "why_it_works": string,
  "predicted_sillage": string,
  "predicted_hours": string,
  "best_for": string,
  "anosmia_warning": string | null,
  "pro_tip": string
}

SCHEMA FIELD CONSTRAINTS:
- \`combo_names\`: Exactly 3 evocative, luxury-tier creative naming options that reflect the combined accord profile.
- \`application_steps\`: An ordered array of steps mapping out the explicit application sequence.
- \`why_it_works\`: A hyper-concise 1-2 sentence molecular/chemical rationale explaining how the heart and base notes interface.
- \`best_for\`: A concise one-line structural contextualization mapping the blend directly to the requested weather, time, and occasion constraints.
- \`pro_tip\`: One advanced application technique specific to this exact pairing (e.g., spatial separation, strategic fabric misting, structural drying delays).`

function valueOrDefault(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function buildUserPrompt(body: FormulatePayload) {
  return `Analyze the following olfactory layering request and compile the synthesis matrix:

- Layer 1 Fragrance:
  * Brand & Name: ${valueOrDefault(body.brand_1, 'Unknown')} ${valueOrDefault(body.name_1, 'Unknown')}
  * Current Evaporation Phase: ${valueOrDefault(body.phase_1, 'Initial Application')}
  * Olfactory Scent Family: ${valueOrDefault(body.family_1, 'Undisclosed')}
  * Baseline Application Zone: ${valueOrDefault(body.application_zone_1, 'Pulse Points')}
  * Preferred Spray Method: ${valueOrDefault(body.application_method_1, 'Standard Spray')}
  * Contextual Anosmia Risk Factor: ${valueOrDefault(body.anosmia_risk_1, 'Low')}

- Layer 2 Fragrance:
  * Brand & Name: ${valueOrDefault(body.brand_2, 'Unknown')} ${valueOrDefault(body.name_2, 'Unknown')}
  * Current Evaporation Phase: ${valueOrDefault(body.phase_2, 'Initial Application')}
  * Olfactory Scent Family: ${valueOrDefault(body.family_2, 'Undisclosed')}
  * Baseline Application Zone: ${valueOrDefault(body.application_zone_2, 'Pulse Points')}
  * Preferred Spray Method: ${valueOrDefault(body.application_method_2, 'Standard Spray')}
  * Contextual Anosmia Risk Factor: ${valueOrDefault(body.anosmia_risk_2, 'Low')}

- Ambient Environmental & Situational Context Matrix:
  * Target Time of Day: ${valueOrDefault(body.time_of_day, 'Anytime')}
  * Macro Weather Condition: ${valueOrDefault(body.weather, 'Moderate Temp')}
  * Targeted Social/Professional Occasion: ${valueOrDefault(body.occasion, 'General Wear')}

Execute structural blending assessment and output the corresponding JSON payload.`
}

function parseJsonObject(contentText: string) {
  try {
    return JSON.parse(contentText)
  } catch {
    const fallbackMatch = contentText.match(/\{[\s\S]*\}/)

    if (!fallbackMatch) {
      throw new Error('Generation engine did not return a JSON object.')
    }

    return JSON.parse(fallbackMatch[0])
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured for the Formulate engine.' },
        { status: 500 }
      )
    }

    const body = (await req.json()) as FormulatePayload
    const userPrompt = buildUserPrompt(body)

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const contentText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim()

    if (!contentText) {
      return NextResponse.json(
        { error: 'Generation engine returned an invalid content structure.' },
        { status: 500 }
      )
    }

    const jsonParsed = parseJsonObject(contentText)

    return NextResponse.json(jsonParsed, { status: 200 })
  } catch (error) {
    console.error('Scentral Formulate Engine Failure Matrix:', error)

    return NextResponse.json(
      {
        error: 'Internal Synthesis Routing Error',
        details: error instanceof Error ? error.message : 'Unhandled exception during system prompt processing.',
      },
      { status: 500 }
    )
  }
}
