-- Optional: pending email invites for people who do not have an account yet.
-- Run this in the Supabase SQL editor. Account creation itself stays open for any email.
create table if not exists public.email_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.chat_profiles(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (inviter_id, email)
);
alter table public.email_invites enable row level security;
drop policy if exists "email_invites_insert_self" on public.email_invites;
create policy "email_invites_insert_self" on public.email_invites
  for insert to authenticated with check (inviter_id = (select auth.uid()));
drop policy if exists "email_invites_select_own" on public.email_invites;
create policy "email_invites_select_own" on public.email_invites
  for select to authenticated using (inviter_id = (select auth.uid()));
