import { NextResponse } from 'next/server'
import { completeJSON } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'
import { priceRecommendationSchema } from '@/lib/schemas/ai'

interface PriceRecommendation {
  suggested_min: number
  suggested_max: number
  confidence: 'low' | 'medium' | 'high'
  reasoning: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = priceRecommendationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  try {
    const output = await completeJSON<PriceRecommendation>([
      {
        role: 'system',
        content:
          'You estimate Philippine produce prices for direct farmer-to-buyer deals. Return JSON: {"suggested_min":number,"suggested_max":number,"confidence":"low|medium|high","reasoning":"..."}. Keep practical and brief.',
      },
      {
        role: 'user',
        content: `Vegetable: ${parsed.data.vegetable}\nQuantity: ${parsed.data.quantity}\nLocation: ${parsed.data.location}\nSeason: ${parsed.data.season}`,
      },
    ])

    await supabase.from('ai_chat_logs').insert({
      user_id: auth.user.id,
      feature: 'price_recommendation',
      prompt: JSON.stringify(parsed.data),
      response: JSON.stringify(output),
    })

    return NextResponse.json(output)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
