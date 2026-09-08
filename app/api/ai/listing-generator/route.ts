import { NextResponse } from 'next/server'
import { completeJSON } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'
import { listingGeneratorSchema } from '@/lib/schemas/ai'

interface ListingGeneratorResponse {
  title: string
  description: string
  highlights: string[]
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = listingGeneratorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  try {
    const output = await completeJSON<ListingGeneratorResponse>([
      { role: 'system', content: 'Generate concise produce listing copy in JSON: {"title":"","description":"","highlights":["..."]}. 3 highlights max.' },
      {
        role: 'user',
        content: `Vegetable: ${parsed.data.vegetable}\nQuantity: ${parsed.data.quantity}\nNotes: ${parsed.data.notes}`,
      },
    ])

    await supabase.from('ai_chat_logs').insert({
      user_id: auth.user.id,
      feature: 'listing_generator',
      prompt: JSON.stringify(parsed.data),
      response: JSON.stringify(output),
    })

    return NextResponse.json(output)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
