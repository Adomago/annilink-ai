# AniLink AI MVP

AniLink AI is a portfolio-grade SaaS MVP for direct farmer-to-buyer produce trading with AI-assisted workflows.

## Stack
- Next.js 16 App Router + TypeScript + Tailwind
- Supabase Auth + Postgres + Storage + RLS
- Groq API via server-side Route Handlers (`/app/api/ai/*`)
- Recharts for admin analytics

## Features
### Farmer
- Register/login and role-routed dashboard
- Create/edit/delete produce listings with image upload
- Receive and process incoming orders (accept/reject/complete/cancel)
- AI tools: assistant chat, listing generator, price recommendation

### Buyer
- Register/login and role-routed dashboard
- Browse marketplace with search/filters
- View listing details and place orders
- Track order history and statuses
- AI farmer matching for sourcing requests

### Admin
- User list with role visibility and suspend toggle
- Listing moderation status updates
- All-orders table
- Analytics cards and charts (orders over time, GMV, listings by category)

## Database model
MVP tables:
- `profiles`
- `listings`
- `orders`
- `ai_chat_logs`

See migration: `/home/runner/work/annilink-ai/annilink-ai/supabase/migrations/20260908143000_init_mvp.sql`

## Environment variables
Copy `.env.example` to `.env.local` and set values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

## Local development
```bash
npm install
npm run dev
```

## Supabase setup
1. Run migration SQL in Supabase SQL editor.
2. Create demo users in Supabase Auth and assign roles by inserting matching rows in `profiles` (same `id` as `auth.users.id`).
3. Optional: run `/home/runner/work/annilink-ai/annilink-ai/supabase/seed/seed_mvp.sql` after at least one farmer profile exists.

## Demo accounts (example)
Create these in Supabase Auth and matching `profiles` rows:
- farmer.demo@anilink.ai (role: farmer)
- buyer.demo@anilink.ai (role: buyer)
- admin.demo@anilink.ai (role: admin)

## AI pricing note
UI includes: **“AI-assisted estimate — verify against local market rates.”**
