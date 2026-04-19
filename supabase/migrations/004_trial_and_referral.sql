-- Trial + referral columns on showbizy_users.
-- Additive only — no existing data touched. Safe to run multiple times.
-- Applied to production 2026-04-19.

alter table public.showbizy_users
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at    timestamptz,
  add column if not exists referral_code    text unique,
  add column if not exists referred_by      text,
  add column if not exists pro_extra_until  timestamptz;

create index if not exists showbizy_users_referral_code_idx
  on public.showbizy_users (referral_code);

create index if not exists showbizy_users_referred_by_idx
  on public.showbizy_users (referred_by);
