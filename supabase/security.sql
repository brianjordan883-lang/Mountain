-- =====================================================================
-- Calma Mountain — защита от спама и ботов (запускать ПОСЛЕ schema.sql)
-- Supabase → SQL Editor → New query → вставить весь файл → Run.
-- Можно запускать повторно: ничего не сломается.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Разумные даты брони
--    Без этого бот может забронировать все даты на годы вперёд,
--    и домики будут выглядеть занятыми для настоящих гостей.
-- ---------------------------------------------------------------------
drop policy if exists "bookings: anyone can create" on public.bookings;
create policy "bookings: anyone can create" on public.bookings
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and cottage_id is not null
    and check_in >= current_date
    and check_in <= current_date + 365          -- не дальше чем на год вперёд
    and check_out - check_in <= 30              -- не больше 30 ночей за раз
    and (user_id is null or user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- 2. Ограничение частоты: не больше N заявок с одного IP за час
--    и не больше 3 ожидающих броней на один email.
-- ---------------------------------------------------------------------

-- IP посетителя. Supabase передаёт его в заголовках запроса.
create or replace function public.client_ip()
returns text
language sql
stable
as $$
  select nullif(btrim(coalesce(
    (current_setting('request.headers', true)::json ->> 'cf-connecting-ip'),
    (current_setting('request.headers', true)::json ->> 'x-real-ip'),
    split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1)
  )), '');
$$;

alter table public.bookings add column if not exists client_ip text;
alter table public.reviews  add column if not exists client_ip text;
create index if not exists bookings_ip_idx on public.bookings (client_ip, created_at desc);
create index if not exists reviews_ip_idx  on public.reviews  (client_ip, created_at desc);

create or replace function public.throttle_bookings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
  pending int;
begin
  if public.is_admin() then
    return new;
  end if;

  new.client_ip := public.client_ip();

  if new.client_ip is not null then
    select count(*) into recent from public.bookings
      where client_ip = new.client_ip and created_at > now() - interval '1 hour';
    if recent >= 5 then
      raise exception 'rate_limit' using errcode = 'P0001';
    end if;
  end if;

  select count(*) into pending from public.bookings
    where lower(email) = lower(new.email) and status = 'pending' and check_out >= current_date;
  if pending >= 3 then
    raise exception 'rate_limit' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create or replace function public.throttle_reviews()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
begin
  if public.is_admin() then
    return new;
  end if;

  new.client_ip := public.client_ip();

  if new.client_ip is not null then
    select count(*) into recent from public.reviews
      where client_ip = new.client_ip and created_at > now() - interval '1 hour';
    if recent >= 3 then
      raise exception 'rate_limit' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_throttle on public.bookings;
create trigger bookings_throttle
  before insert on public.bookings
  for each row execute function public.throttle_bookings();

drop trigger if exists reviews_throttle on public.reviews;
create trigger reviews_throttle
  before insert on public.reviews
  for each row execute function public.throttle_reviews();

-- Эти функции вызывает только сама база, не браузер.
revoke execute on function public.throttle_bookings() from public, anon, authenticated;
revoke execute on function public.throttle_reviews()  from public, anon, authenticated;
