import { NextResponse } from 'next/server'
import { ai } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'
import { assistantSchema } from '@/lib/schemas/ai'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = assistantSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })
  }

  const systemMessage = {
    role: 'system' as const,
    content:
      'You are AniLink AI assistant for Philippine produce farmers and institutional buyers. Give concise and practical guidance. Mention food safety and realistic market operations when relevant.',
  }

  try {
    const response = await ai.complete([systemMessage, ...parsed.data.messages], { temperature: 0.4, maxTokens: 500 })
    await supabase.from('ai_chat_logs').insert({
      user_id: auth.user.id,
      feature: 'assistant_chat',
      prompt: JSON.stringify(parsed.data.messages),
      response,
    })

    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
