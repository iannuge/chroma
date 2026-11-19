-- Run once in Supabase > SQL Editor on your EXISTING database.
-- Items are image-only now, so the caption becomes optional.

alter table public.items drop constraint if exists items_caption_check;
alter table public.items alter column caption drop not null;
alter table public.items
  add constraint items_caption_check check (caption is null or char_length(caption) between 1 and 120);
