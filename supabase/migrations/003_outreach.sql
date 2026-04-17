-- Industry professionals (sourced from Apollo.io for matching + display)
create table if not exists public.showbizy_professionals (
  id uuid primary key default gen_random_uuid(),
  apollo_id text,
  name text not null,
  email text,
  title text,
  company text,
  city text,
  country text,
  linkedin_url text,
  photo_url text,
  skills text[] default '{}',
  streams text[] default '{}',
  headline text,
  source text default 'apollo',
  invite_sent boolean default false,
  invite_sent_at timestamptz,
  signed_up boolean default false,
  is_displayed boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_professionals_city on public.showbizy_professionals(city);
create index if not exists idx_professionals_title on public.showbizy_professionals(title);
