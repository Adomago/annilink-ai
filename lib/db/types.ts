export type UserRole = 'farmer' | 'buyer' | 'admin'
export type ListingStatus = 'active' | 'sold_out' | 'archived'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'
export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  location: string | null
  farm_name: string | null
  business_name: string | null
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  farmer_id: string
  title: string
  description: string
  category: string
  vegetable: string
  quantity_kg: number
  available_quantity_kg: number
  price_per_kg: number
  unit: string
  location: string
  harvest_date: string
  image_url: string | null
  image_path: string | null
  status: ListingStatus
  moderation_status: ModerationStatus
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  listing_id: string
  buyer_id: string
  farmer_id: string
  quantity_kg: number
  price_per_kg: number
  total_price: number
  delivery_date: string
  notes: string | null
  status: OrderStatus
  created_at: string
  updated_at: string
}
