import { PageShell } from '@/components/layout/page-shell'
import { PriceRecommendationClient } from '@/components/ai/price-recommendation-client'

export default function PriceRecommendationPage() {
  return (
    <PageShell title="AI Price Recommendation" subtitle="Get AI-assisted listing prices for your harvest." role="farmer">
      <PriceRecommendationClient />
    </PageShell>
  )
}
