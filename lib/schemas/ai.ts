import { z } from 'zod'

export const assistantSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1),
    })
  ).min(1),
})

export const listingGeneratorSchema = z.object({
  vegetable: z.string().min(2),
  quantity: z.string().min(1),
  notes: z.string().min(1),
})

export const priceRecommendationSchema = z.object({
  vegetable: z.string().min(2),
  quantity: z.string().min(1),
  location: z.string().min(2),
  season: z.string().min(2),
})

export const farmerMatchingSchema = z.object({
  request: z.string().min(3),
})
