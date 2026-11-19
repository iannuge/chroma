-- OPTIONAL starter moodboard for drop 03.
-- Run this in Supabase > SQL Editor AFTER you have signed in to the site once with Google,
-- so a profile exists. The starter clusters will show as created by the first account.

with me as (
  select id from public.profiles order by created_at limit 1
),
d as (
  select id from public.drops where number = 3
),
c as (
  insert into public.clusters (drop_id, name, created_by)
  select d.id, v.name, me.id
  from d, me,
       (values ('Signal loss'), ('Hazard tape'), ('Dial-up'), ('Quiet blue'), ('Lost and found')) as v(name)
  returning id, name
)
insert into public.items (cluster_id, caption, color, created_by)
select c.id, v.caption, v.color, (select id from me)
from c
join (values
  ('Signal loss',    'TV snow in 1-bit',          '#d9d9d6'),
  ('Signal loss',    'CRT scanlines',             '#1b1b1b'),
  ('Signal loss',    'Test-pattern bars',         '#f2c200'),
  ('Signal loss',    'Dropped frame',             '#1f3bff'),
  ('Hazard tape',    'Diagonal stripes',          '#f2c200'),
  ('Hazard tape',    'Stencil serial no.',        '#222222'),
  ('Hazard tape',    'Safety orange',             '#e8590c'),
  ('Dial-up',        'Modem handshake',           '#6a6f7a'),
  ('Dial-up',        '56k',                       '#cfd3da'),
  ('Quiet blue',     'Overexposed sky',           '#9db8ff'),
  ('Quiet blue',     'Pool tile',                 '#2b6cb0'),
  ('Lost and found', 'Photocopy of a photocopy',  '#bdbdb8')
) as v(cname, caption, color) on v.cname = c.name;
