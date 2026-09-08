import { z } from 'zod'

export const listingSchema = z.object({
  title: z.string().min(4, 'Title is required').trim(),
  description: z.string().min(10, 'Description is too short').trim(),
  category: z.string().min(2, 'Category is required').trim(),
  vegetable: z.string().min(2, 'Vegetable is required').trim(),
  quantity_kg: z.coerce.number().positive('Quantity must be positive'),
  price_per_kg: z.coerce.number().positive('Price must be positive'),
  unit: z.string().default('kg'),
  location: z.string().min(2, 'Location is required').trim(),
  harvest_date: z.string().min(4, 'Harvest date is required'),
  status: z.enum(['active', 'sold_out', 'archived']).default('active'),
})

export const orderCreateSchema = z.object({
  quantity_kg: z.coerce.number().positive('Quantity must be positive'),
  delivery_date: z.string().min(4, 'Delivery date is required'),
  notes: z.string().trim().optional(),
})

export const orderStatusSchema = z.object({
  order_id: z.uuid(),
  status: z.enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled']),
})
