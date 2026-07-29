import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ai } from '@/lib/ai'

export async function GET() {
  const result = {
    supabase: 'unknown' as string,
    ai: 'unknown' as string,
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.getUser()
    result.supabase = error && error.name !== 'AuthSessionMissingError'
      ? `error: ${error.message}`
      : 'ok'
  } catch (e) {
    result.supabase = `error: ${(e as Error).message}`
  }

  try {
    const reply = await ai.complete(
      [{ role: 'user', content: 'Reply with exactly: pong' }],
      { maxTokens: 10, temperature: 0 }
    )
    result.ai = reply.trim().toLowerCase().includes('pong')
      ? 'ok'
      : `unexpected: ${reply}`
  } catch (e) {
    result.ai = `error: ${(e as Error).message}`
  }

  const healthy = result.supabase === 'ok' && result.ai === 'ok'
  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', ...result },
    { status: healthy ? 200 : 503 }
  )
}