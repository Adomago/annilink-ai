-- AniLink AI seed data (~30 listings)
-- Prerequisite: Create demo users in Supabase Auth first, then ensure they have profiles with role='farmer'.

with farmer_profiles as (
  select id, coalesce(farm_name, full_name) as farmer_name, coalesce(location, 'Luzon') as location
  from public.profiles
  where role = 'farmer'
  order by created_at asc
  limit 8
),
produce_template as (
  select * from (values
    ('Leafy Greens','Pechay',240.0,38.0,'Benguet','2026-09-03'::date),
    ('Leafy Greens','Kangkong',300.0,28.0,'Bulacan','2026-09-04'::date),
    ('Fruit Vegetables','Tomatoes',500.0,62.0,'Nueva Ecija','2026-09-05'::date),
    ('Fruit Vegetables','Ampalaya',280.0,76.0,'Laguna','2026-09-05'::date),
    ('Root Crops','Carrots',350.0,70.0,'Benguet','2026-09-06'::date),
    ('Root Crops','Potatoes',700.0,54.0,'Bukidnon','2026-09-06'::date),
    ('Bulbs','Red Onion',420.0,115.0,'Nueva Ecija','2026-09-06'::date),
    ('Bulbs','Garlic',180.0,180.0,'Ilocos Norte','2026-09-07'::date),
    ('Legumes','Sitaw',250.0,68.0,'Quezon','2026-09-04'::date),
    ('Cruciferous','Cabbage',620.0,45.0,'Benguet','2026-09-05'::date),
    ('Cruciferous','Cauliflower',300.0,82.0,'Benguet','2026-09-05'::date),
    ('Cruciferous','Broccoli',190.0,130.0,'Benguet','2026-09-06'::date),
    ('Fruit Vegetables','Eggplant',420.0,57.0,'Batangas','2026-09-04'::date),
    ('Fruit Vegetables','Bell Pepper',210.0,102.0,'Benguet','2026-09-07'::date),
    ('Leafy Greens','Lettuce',260.0,90.0,'Bukidnon','2026-09-07'::date),
    ('Leafy Greens','Mustasa',200.0,35.0,'Pampanga','2026-09-03'::date),
    ('Fruit Vegetables','Cucumber',360.0,50.0,'Laguna','2026-09-06'::date),
    ('Fruit Vegetables','Okra',190.0,66.0,'Quezon','2026-09-06'::date),
    ('Squash','Kalabasa',800.0,34.0,'Nueva Vizcaya','2026-09-05'::date),
    ('Bulbs','White Onion',500.0,95.0,'Tarlac','2026-09-05'::date),
    ('Leafy Greens','Pechay Baguio',240.0,55.0,'Benguet','2026-09-07'::date),
    ('Root Crops','Sweet Potato',600.0,42.0,'Bataan','2026-09-06'::date),
    ('Legumes','Baguio Beans',280.0,88.0,'Benguet','2026-09-07'::date),
    ('Leafy Greens','Malunggay',140.0,75.0,'Batangas','2026-09-03'::date),
    ('Fruit Vegetables','Chili',110.0,140.0,'Quezon','2026-09-04'::date),
    ('Fruit Vegetables','Sayote',460.0,32.0,'Benguet','2026-09-06'::date),
    ('Cruciferous','Pechay Tagalog',350.0,33.0,'Rizal','2026-09-05'::date),
    ('Root Crops','Ginger',170.0,120.0,'Bukidnon','2026-09-07'::date),
    ('Herbs','Spring Onion',130.0,100.0,'Benguet','2026-09-06'::date),
    ('Fruit Vegetables','Upo',380.0,40.0,'Laguna','2026-09-05'::date)
  ) as t(category, vegetable, quantity_kg, price_per_kg, location, harvest_date)
),
assigned as (
  select
    gen_random_uuid() as id,
    fp.id as farmer_id,
    pt.category,
    pt.vegetable,
    pt.quantity_kg,
    pt.quantity_kg as available_quantity_kg,
    pt.price_per_kg,
    pt.location,
    pt.harvest_date,
    concat(pt.vegetable, ' fresh harvest from ', fp.farmer_name) as title,
    concat('Fresh ', pt.vegetable, ' from ', fp.farmer_name, '. Harvested recently and ready for institutional buyers.') as description,
    row_number() over () as rn
  from produce_template pt
  join lateral (
    select id, farmer_name from farmer_profiles
    order by random()
    limit 1
  ) fp on true
)
insert into public.listings (
  id, farmer_id, title, description, category, vegetable,
  quantity_kg, available_quantity_kg, price_per_kg, unit, location, harvest_date,
  status, moderation_status
)
select
  id, farmer_id, title, description, category, vegetable,
  quantity_kg, available_quantity_kg, price_per_kg, 'kg', location, harvest_date,
  'active', 'approved'
from assigned;
