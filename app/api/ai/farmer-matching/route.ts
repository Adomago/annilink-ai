import { NextResponse } from 'next/server'
import { completeJSON } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'
import { farmerMatchingSchema } from '@/lib/schemas/ai'

interface Match {
  listing_id: string
  farmer: string
  location: string
  vegetable: string
  available_quantity_kg: number
  price_per_kg: number
  score: number
  reason: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = farmerMatchingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('id,title,vegetable,location,available_quantity_kg,price_per_kg,farmer_id')
    .eq('status', 'active')
    .eq('moderation_status', 'approved')
    .limit(20)

  const farmerIds = [...new Set((listings ?? []).map((item) => item.farmer_id))]
  const { data: profiles } = farmerIds.length
    ? await supabase.from('profiles').select('id,full_name,farm_name').in('id', farmerIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((item) => [item.id, item]))

  const candidateData = (listings ?? []).map((listing) => ({
    listing_id: listing.id,
    farmer: profileMap.get(listing.farmer_id)?.farm_name || profileMap.get(listing.farmer_id)?.full_name || 'Verified farmer',
    location: listing.location,
    vegetable: listing.vegetable,
    available_quantity_kg: listing.available_quantity_kg,
    price_per_kg: listing.price_per_kg,
  }))

  try {
    const output = await completeJSON<{ matches: Match[] }>([
      {
        role: 'system',
        content:
          'Given buyer requirements and listing candidates, rank the top 5 matches. Return JSON {"matches":[{"listing_id":"","farmer":"","location":"","vegetable":"","available_quantity_kg":0,"price_per_kg":0,"score":0,"reason":""}]}. score 0-100.',
      },
      {
        role: 'user',
        content: `Buyer request: ${parsed.data.request}\nCandidates: ${JSON.stringify(candidateData)}`,
      },
    ])

    await supabase.from('ai_chat_logs').insert({
      user_id: auth.user.id,
      feature: 'farmer_matching',
      prompt: parsed.data.request,
      response: JSON.stringify(output),
    })

    return NextResponse.json({ matches: output.matches ?? [] })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
