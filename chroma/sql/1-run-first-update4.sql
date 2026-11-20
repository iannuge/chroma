-- rename the current drop to drop 00 "genesis"
update public.drops set number = 0, theme = 'genesis' where number = 3;

-- recolor the blue starter placeholders to orange
update public.items set color = '#F24D11' where color = '#1f3bff';
update public.items set color = '#f6b79c' where color = '#9db8ff';
update public.items set color = '#c23d0a' where color = '#2b6cb0';
