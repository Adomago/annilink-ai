import { createListingAction, updateListingAction } from '@/app/actions/listings'
import type { Listing } from '@/lib/db/types'

interface ListingFormProps {
  mode: 'create' | 'edit'
  listing?: Listing
}

export function ListingForm({ mode, listing }: ListingFormProps) {
  const action = mode === 'create' ? createListingAction : updateListingAction

  return (
    <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      {mode === 'edit' ? <input name="listing_id" value={listing?.id} readOnly hidden /> : null}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="title">Title</label>
        <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="title" name="title" defaultValue={listing?.title} required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="description">Description</label>
        <textarea className="min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2" id="description" name="description" defaultValue={listing?.description} required />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="category">Category</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="category" name="category" defaultValue={listing?.category} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="vegetable">Produce</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="vegetable" name="vegetable" defaultValue={listing?.vegetable} required />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="quantity_kg">Total Quantity (kg)</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="quantity_kg" name="quantity_kg" type="number" min="1" step="0.01" defaultValue={listing?.quantity_kg} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="price_per_kg">Price per kg (₱)</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="price_per_kg" name="price_per_kg" type="number" min="1" step="0.01" defaultValue={listing?.price_per_kg} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="unit">Unit</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="unit" name="unit" defaultValue={listing?.unit ?? 'kg'} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="harvest_date">Harvest Date</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="harvest_date" name="harvest_date" type="date" defaultValue={listing?.harvest_date} required />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="location">Location</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="location" name="location" defaultValue={listing?.location} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="status">Listing Status</label>
          <select className="w-full rounded-md border border-zinc-300 px-3 py-2" id="status" name="status" defaultValue={listing?.status ?? 'active'}>
            <option value="active">active</option>
            <option value="sold_out">sold_out</option>
            <option value="archived">archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="image">Listing image</label>
        <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="image" name="image" type="file" accept="image/*" />
      </div>

      {listing?.image_url ? (
        <div>
          <p className="mb-2 text-sm text-zinc-600">Current image</p>
          <img src={listing.image_url} alt={listing.title} className="h-36 w-full max-w-sm rounded-md object-cover" />
        </div>
      ) : null}

      <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-white">
        {mode === 'create' ? 'Create listing' : 'Update listing'}
      </button>
    </form>
  )
}
