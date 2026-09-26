-- CHRISXCHANGE one-to-one realtime chat
create extension if not exists pgcrypto;
create table if not exists public.chat_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'CHRISXCHANGE Member',
  email text unique not null,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.chat_profiles(id) on delete cascade,
  receiver_id uuid not null references public.chat_profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists messages_sender_receiver_idx on public.messages(sender_id,receiver_id,created_at);
create index if not exists messages_receiver_sender_idx on public.messages(receiver_id,sender_id,created_at);
alter table public.chat_profiles enable row level security;
alter table public.messages enable row level security;
drop policy if exists "chat_profiles_select_authenticated" on public.chat_profiles;
create policy "chat_profiles_select_authenticated" on public.chat_profiles for select to authenticated using (true);
drop policy if exists "chat_profiles_insert_self" on public.chat_profiles;
create policy "chat_profiles_insert_self" on public.chat_profiles for insert to authenticated with check (id=(select auth.uid()));
drop policy if exists "chat_profiles_update_self" on public.chat_profiles;
create policy "chat_profiles_update_self" on public.chat_profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages for select to authenticated using (sender_id=(select auth.uid()) or receiver_id=(select auth.uid()));
drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages for insert to authenticated with check (sender_id=(select auth.uid()));
alter table public.messages replica identity full;
alter table public.chat_profiles replica identity full;
do $$ begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.chat_profiles; exception when duplicate_object then null; end $$;
create or replace function public.handle_new_chat_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.chat_profiles(id,full_name,email)
 values(new.id,coalesce(nullif(new.raw_user_meta_data->>'full_name',''),'CHRISXCHANGE Member'),coalesce(new.email,''))
 on conflict(id) do update set email=excluded.email,full_name=excluded.full_name;
 return new;
end; $$;
revoke all on function public.handle_new_chat_user() from public,anon,authenticated;
grant execute on function public.handle_new_chat_user() to postgres;
drop trigger if exists on_auth_user_created_chat on auth.users;
create trigger on_auth_user_created_chat after insert on auth.users for each row execute procedure public.handle_new_chat_user();
