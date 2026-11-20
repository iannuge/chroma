-- CHROMA: "the top cluster becomes the shirt" format.
-- Run this in Supabase > SQL Editor BEFORE deploying the matching site update.
-- (If a "potential issue / RLS" popup appears, choose "Run and enable RLS". It is a false alarm.)

-- 1. New columns
alter table public.clusters add column if not exists won_drop_id uuid references public.drops(id) on delete set null;
alter table public.drops    add column if not exists winning_cluster_id uuid references public.clusters(id) on delete set null;
alter table public.drops    add column if not exists design_image text;   -- e.g. '/past/genesis.jpg' (file in the site's public folder) or a full image URL
alter table public.drops    add column if not exists produced int;        -- how many were made
alter table public.drops    add column if not exists released_on date;

-- 2. The drop that is currently open (the highest number)
create or replace function public.current_drop_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.drops order by number desc limit 1;
$$;

-- 3. Scores: clusters now carry over between drops, so weight votes by the current drop
--    (or by the drop a retired cluster won, so its final score stays put).
create or replace view public.item_scores as
select i.id as item_id,
       i.cluster_id,
       coalesce(sum(v.value * public.vote_weight(v.user_id, coalesce(c.won_drop_id, public.current_drop_id()))), 0) as score
from public.items i
join public.clusters c on c.id = i.cluster_id
left join public.item_votes v on v.item_id = i.id
group by i.id, i.cluster_id;

create or replace view public.cluster_scores as
select c.id as cluster_id,
       c.drop_id,
       coalesce(sum(v.value * public.vote_weight(v.user_id, coalesce(c.won_drop_id, public.current_drop_id()))), 0) as score
from public.clusters c
left join public.cluster_votes v on v.cluster_id = c.id
group by c.id, c.drop_id;

grant select on public.item_scores, public.cluster_scores to anon, authenticated;

-- 4. Retired clusters are closed: no new images, no new votes
drop policy if exists "items add" on public.items;
create policy "items add" on public.items for insert to authenticated
  with check (created_by = auth.uid()
    and exists (select 1 from public.clusters c where c.id = cluster_id and c.won_drop_id is null));

drop policy if exists "cluster votes own insert" on public.cluster_votes;
create policy "cluster votes own insert" on public.cluster_votes for insert to authenticated
  with check (user_id = auth.uid()
    and exists (select 1 from public.clusters c where c.id = cluster_id and c.won_drop_id is null));
drop policy if exists "cluster votes own update" on public.cluster_votes;
create policy "cluster votes own update" on public.cluster_votes for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and exists (select 1 from public.clusters c where c.id = cluster_id and c.won_drop_id is null));

drop policy if exists "item votes own insert" on public.item_votes;
create policy "item votes own insert" on public.item_votes for insert to authenticated
  with check (user_id = auth.uid()
    and exists (select 1 from public.items i join public.clusters c on c.id = i.cluster_id
                where i.id = item_id and c.won_drop_id is null));
drop policy if exists "item votes own update" on public.item_votes;
create policy "item votes own update" on public.item_votes for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and exists (select 1 from public.items i join public.clusters c on c.id = i.cluster_id
                where i.id = item_id and c.won_drop_id is null));

-- 5. Lock in the winner. You run this yourself when the two weeks are up:
--      select public.lock_winner(0);      -- 0 = the drop number
--    It picks the top-scoring active cluster (ties go to the older cluster), retires it,
--    attaches it to that drop, and moves the drop to the "design" phase.
create or replace function public.lock_winner(drop_number int)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  d uuid;
  w uuid;
  wname text;
begin
  select id into d from public.drops where number = drop_number;
  if d is null then raise exception 'No drop with number %', drop_number; end if;
  if exists (select 1 from public.drops where id = d and winning_cluster_id is not null) then
    raise exception 'Drop % already has a winner', drop_number;
  end if;

  select c.id, c.name into w, wname
  from public.clusters c
  join public.cluster_scores s on s.cluster_id = c.id
  where c.won_drop_id is null
  order by s.score desc, c.created_at asc
  limit 1;
  if w is null then raise exception 'There are no active clusters to choose from'; end if;

  update public.clusters set won_drop_id = d where id = w;
  update public.drops
     set winning_cluster_id = w,
         status = case when status = 'moodboard' then 'design' else status end
   where id = d;
  return wname;
end;
$$;

-- Only you (from the SQL Editor) may run it. Never the website.
revoke execute on function public.lock_winner(int) from public, anon, authenticated;

-- 6. When a drop is finished, fill in its details so it shows on the Past drops page, e.g.:
--    update public.drops
--       set status = 'shipped', design_image = '/past/genesis.jpg', produced = 100, released_on = '2026-12-20'
--     where number = 0;
