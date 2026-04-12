-- Project chat messages
create table if not exists public.showbizy_messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null,
  user_id uuid not null,
  user_name text not null,
  user_avatar text,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists idx_messages_project on public.showbizy_messages(project_id, created_at);
