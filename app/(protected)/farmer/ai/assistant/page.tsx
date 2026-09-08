import { PageShell } from '@/components/layout/page-shell'
import { AssistantClient } from '@/components/ai/assistant-client'

export default function AssistantPage() {
  return (
    <PageShell title="AI Farming Assistant" subtitle="Ask farming and platform questions with contextual answers." role="farmer">
      <AssistantClient />
    </PageShell>
  )
}
