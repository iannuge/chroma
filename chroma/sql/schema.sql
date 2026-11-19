-- CHROMA database setup for Supabase
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run.
-- Written but not yet run against a live project, so tell me about any error message.

-- ---------- Tables ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Someone',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.drops (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  theme text not null,
  status text not null default 'moodboard'
    check (status in ('moodboard','design','sold_out','approval','printing','shipped')),
  goal int not null default 100,
  price_cents int not null,
  next_iteration_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.clusters (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid not null references public.drops(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid not null references public.clusters(id) on delete cascade,
  caption text not null check (char_length(caption) between 1 and 120),
  image_path text,                       -- path inside the "moodboard" storage bucket
  color text,                            -- fallback tile color when there is no image
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.cluster_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  cluster_id uuid not null references public.clusters(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (user_id, cluster_id)
);

create table public.item_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (user_id, item_id)
);

-- Orders are written ONLY by your server (a Shopify webhook), never by the browser.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,  -- filled in by email match
  email text not null,
  drop_id uuid not null references public.drops(id) on delete cascade,
  shopify_order_id text unique,
  created_at timestamptz not null default now()
);
create index orders_email_idx on public.orders (lower(email));
create index orders_user_idx on public.orders (user_id);

create table public.approvals (
  user_id uuid not null references public.profiles(id) on delete cascade,
  drop_id uuid not null references public.drops(id) on delete cascade,
  approve boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, drop_id)
);

-- ---------- New user: create profile, link earlier orders by email ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name',
             split_part(new.email, '@', 1),
             'Someone'),
    new.raw_user_meta_data->>'avatar_url'
  );
  update public.orders
     set user_id = new.id
   where user_id is null and lower(email) = lower(new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Vote weight (kept on the server so it can't be faked) ----------

create or replace function public.vote_weight(uid uuid, did uuid)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select 1
    + case when exists (
        select 1 from public.orders o
        where o.user_id = uid and o.drop_id = did) then 1 else 0 end
    + case when exists (
        select 1 from public.orders o
        join public.drops od on od.id = o.drop_id
        where o.user_id = uid
          and od.number < (select number from public.drops where id = did)) then 0.5 else 0 end;
$$;

-- ---------- Scores ----------

create view public.item_scores as
select i.id as item_id,
       i.cluster_id,
       coalesce(sum(v.value * public.vote_weight(v.user_id, c.drop_id)), 0) as score
from public.items i
join public.clusters c on c.id = i.cluster_id
left join public.item_votes v on v.item_id = i.id
group by i.id, i.cluster_id;

create view public.cluster_scores as
select c.id as cluster_id,
       c.drop_id,
       coalesce(sum(v.value * public.vote_weight(v.user_id, c.drop_id)), 0) as score
from public.clusters c
left join public.cluster_votes v on v.cluster_id = c.id
group by c.id, c.drop_id;

create view public.drop_progress as
select d.id as drop_id,
       d.goal,
       (select count(*) from public.orders o where o.drop_id = d.id) as claimed
from public.drops d;

create view public.approval_progress as
select d.id as drop_id,
       count(a.*) filter (where a.approve) as yes_votes,
       count(a.*) as total_votes,
       (select count(*) from public.orders o where o.drop_id = d.id) as buyers
from public.drops d
left join public.approvals a on a.drop_id = d.id
group by d.id;

-- ---------- Row level security ----------

alter table public.profiles       enable row level security;
alter table public.drops          enable row level security;
alter table public.clusters       enable row level security;
alter table public.items          enable row level security;
alter table public.cluster_votes  enable row level security;
alter table public.item_votes     enable row level security;
alter table public.orders         enable row level security;
alter table public.approvals      enable row level security;

create policy "profiles readable"   on public.profiles for select using (true);
create policy "profiles edit own"   on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "drops readable"      on public.drops for select using (true);

create policy "clusters readable"   on public.clusters for select using (true);
create policy "clusters add"        on public.clusters for insert to authenticated with check (created_by = auth.uid());
create policy "clusters delete own" on public.clusters for delete to authenticated using (created_by = auth.uid());

create policy "items readable"      on public.items for select using (true);
create policy "items add"           on public.items for insert to authenticated with check (created_by = auth.uid());
create policy "items delete own"    on public.items for delete to authenticated using (created_by = auth.uid());

-- Votes: you can only see and change your own. Everyone sees totals through the views above.
create policy "cluster votes own select" on public.cluster_votes for select to authenticated using (user_id = auth.uid());
create policy "cluster votes own insert" on public.cluster_votes for insert to authenticated with check (user_id = auth.uid());
create policy "cluster votes own update" on public.cluster_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cluster votes own delete" on public.cluster_votes for delete to authenticated using (user_id = auth.uid());

create policy "item votes own select" on public.item_votes for select to authenticated using (user_id = auth.uid());
create policy "item votes own insert" on public.item_votes for insert to authenticated with check (user_id = auth.uid());
create policy "item votes own update" on public.item_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "item votes own delete" on public.item_votes for delete to authenticated using (user_id = auth.uid());

-- Orders: you can read your own. No insert policy on purpose: only the server key can write them.
create policy "orders own select" on public.orders for select to authenticated using (user_id = auth.uid());

-- Approvals: only people who bought this drop can approve it, once each (you can change your answer).
create policy "approvals own select" on public.approvals for select to authenticated using (user_id = auth.uid());
create policy "approvals buyers insert" on public.approvals for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.orders o where o.user_id = auth.uid() and o.drop_id = approvals.drop_id));
create policy "approvals buyers update" on public.approvals for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Image storage ----------

insert into storage.buckets (id, name, public)
values ('moodboard', 'moodboard', true)
on conflict (id) do nothing;

create policy "moodboard images readable" on storage.objects
  for select using (bucket_id = 'moodboard');

create policy "moodboard upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'moodboard' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- Live updates ----------

alter publication supabase_realtime add table public.clusters, public.items;

-- ---------- Starting data: the current drop ----------

insert into public.drops (number, theme, status, goal, price_cents, next_iteration_at)
values (3, 'static', 'moodboard', 100, 4200, now() + interval '7 days');
