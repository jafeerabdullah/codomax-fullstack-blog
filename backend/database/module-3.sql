begin;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null unique check (email = lower(btrim(email))),
  password text not null check (password ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (category in ('Web Development', 'Design', 'Productivity', 'Technology', 'Personal Growth')),
  content text not null check (char_length(content) between 1 and 30000),
  image text not null default 'images/code-workspace.jpg',
  author_id uuid not null references public.users(id) on delete cascade,
  author_name text not null,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists codomax_blogs_status_created_idx on public.blogs(status, created_at desc, id desc);
create index if not exists codomax_blogs_author_created_idx on public.blogs(author_id, created_at desc, id desc);

create or replace function public.codomax_set_blog_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists codomax_blog_updated_at on public.blogs;
create trigger codomax_blog_updated_at before update on public.blogs
for each row execute function public.codomax_set_blog_updated_at();


alter table public.users enable row level security;
alter table public.blogs enable row level security;
revoke all on table public.users, public.blogs from anon, authenticated;
grant select, insert, update, delete on table public.users, public.blogs to service_role;

commit;
