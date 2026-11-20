-- First drop: 20 pieces, and the countdown to "clusters are chosen".
-- Change the date below to the moment you want clusters to lock in (this one is 14 days from when you run it).
update public.drops
   set goal = 20,
       next_iteration_at = now() + interval '14 days'
 where number = 0;
