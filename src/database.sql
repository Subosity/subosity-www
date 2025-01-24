-- Idempotent script: drop existing tables and policies, then recreate them.

-- Drop in reverse dependency order
drop table if exists subscription cascade;
drop table if exists preferences cascade;
drop table if exists subscription_provider cascade;
drop table if exists payment_provider cascade;

-- Create provider table
create table if not exists subscription_provider (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users null,
  name text not null,
  description text,
  category text,
  website text,
  unsubscribe_url text,
  is_default boolean default false,
  is_public boolean default false,
  icon text
);

create table if not exists payment_provider (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users null,
  name text not null,
  description text,
  icon text,
  is_default boolean default false,
  is_public boolean default false
);

-- Create preferences table
create table if not exists preferences (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users not null,
  preference_key text not null,
  preference_value text
);

create table if not exists subscription (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users not null,
  subscription_provider_id uuid references subscription_provider(id),
  nickname text,
  start_date date,
  autorenew boolean default false,
  renew_frequency text,
  amount numeric(10,2),
  payment_details text,
  notes text,
  is_free_trial boolean default false,
  payment_provider_id uuid references payment_provider(id)
);

-- Enable RLS
alter table subscription_provider enable row level security;
alter table subscription enable row level security;
alter table preferences enable row level security;
alter table payment_provider enable row level security;

--------------------------------------------------------------------------------
-- SUBSCRIPTION_PROVIDER TABLE POLICIES
--------------------------------------------------------------------------------

-- Anyone can SELECT if is_public = true OR owner = auth.uid()
create policy subscription_provider_select_public_or_owner
  on subscription_provider
  for select
  using ( is_public or owner = auth.uid() );

-- Anyone can INSERT, but must ensure owner = auth.uid()
create policy subscription_provider_insert_with_owner
  on subscription_provider
  for insert
  with check ( owner = auth.uid() );

-- Only owner can UPDATE
create policy subscription_provider_update_owned
  on subscription_provider
  for update
  using ( owner = auth.uid() )
  with check ( owner = auth.uid() );

-- Only owner can DELETE
create policy subscription_provider_delete_owned
  on subscription_provider
  for delete
  using ( owner = auth.uid() );

--------------------------------------------------------------------------------
-- PAYMENT_PROVIDER TABLE POLICIES
--------------------------------------------------------------------------------

create policy "Users can view public payment providers"
  on payment_provider for select
  using (
    is_public = true OR owner = auth.uid()
  );

create policy "Users can view own payment providers" 
  on payment_provider for select
  using (auth.uid() = owner);

create policy "Users can insert own payment providers"
  on payment_provider for insert
  with check (auth.uid() = owner);

create policy "Users can update own payment providers"
  on payment_provider for update
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

create policy "Users can delete own payment providers"
  on payment_provider for delete
  using (auth.uid() = owner);


--------------------------------------------------------------------------------
-- SUBSCRIPTION TABLE POLICIES
--------------------------------------------------------------------------------

-- Only owner can SELECT
create policy subscription_select_owned
  on subscription
  for select
  using ( owner = auth.uid() );

-- Only owner can INSERT
create policy subscription_insert_with_owner
  on subscription
  for insert
  with check ( owner = auth.uid() );

-- Only owner can UPDATE
create policy subscription_update_owned
  on subscription
  for update
  using ( owner = auth.uid() )
  with check ( owner = auth.uid() );

-- Only owner can DELETE
create policy subscription_delete_owned
  on subscription
  for delete
  using ( owner = auth.uid() );

--------------------------------------------------------------------------------
-- PREFERENCES TABLE POLICIES
--------------------------------------------------------------------------------

-- Only owner can SELECT
create policy preferences_select_owned
  on preferences
  for select
  using ( owner = auth.uid() );

-- Only owner can INSERT
create policy preferences_insert_with_owner
  on preferences
  for insert
  with check ( owner = auth.uid() );

-- Only owner can UPDATE
create policy preferences_update_owned
  on preferences
  for update
  using ( owner = auth.uid() )
  with check ( owner = auth.uid() );

-- Only owner can DELETE
create policy preferences_delete_owned
  on preferences
  for delete
  using ( owner = auth.uid() );

-- SAMPLE/STARTER DATA

WITH user_id AS (
    SELECT id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1
)


INSERT INTO public.subscription_provider (name, icon, is_default, is_public, owner, description, website, category, unsubscribe_url)
VALUES
  ('Netflix', 'https://cdn.brandfetch.io/ideQwN5lBE/w/496/h/901/theme/dark/symbol.png?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Streaming service for movies and TV shows', 'https://www.netflix.com', 'Entertainment', 'https://www.netflix.com/cancelplan'),
  ('T-Mobile', 'https://cdn.brandfetch.io/id9-QI5PX1/theme/dark/idQYOPtBv0.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Mobile phone service provider', 'https://www.t-mobile.com', 'Telecommunications', 'https://www.t-mobile.com/cancel-service'),
  ('HBO', 'https://static.cdnlogo.com/logos/h/37/hbo.svg', true, true, (SELECT id FROM user_id), 'Premium cable and streaming service', 'https://www.hbo.com', 'Entertainment', 'https://help.hbomax.com/us/Answer/Detail/000001346'),
  ('Amazon Prime', 'https://cdn.brandfetch.io/idpNfvnr6a/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Subscription service offering streaming, shopping, and more', 'https://www.amazon.com/prime', 'Entertainment', 'https://www.amazon.com/gp/help/customer/display.html?nodeId=G2T3ZL8Z3K4P4Z7H'),
  ('Hulu', 'https://cdn.brandfetch.io/id4KRloCCr/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Streaming service for TV shows, movies, and live TV', 'https://www.hulu.com', 'Entertainment', 'https://help.hulu.com/s/article/how-do-i-cancel-my-subscription'),
  ('Disney+', 'https://cdn.brandfetch.io/idhQlYRiX2/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Streaming service for Disney content', 'https://www.disneyplus.com', 'Entertainment', 'https://help.disneyplus.com/csp?id=csp_article_content&sys_kb_id=3b4d2b5adb3c5c10e7f3f1f31d9619d4'),
  ('Spotify', 'https://cdn.brandfetch.io/id20mQyGeY/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Music streaming service', 'https://www.spotify.com', 'Music', 'https://support.spotify.com/us/article/how-to-cancel-your-subscription/'),
  ('Apple Music', 'https://cdn.brandfetch.io/id_yBTuraI/theme/light/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Music streaming service by Apple', 'https://www.apple.com/apple-music', 'Music', 'https://support.apple.com/en-us/HT202039'),
  ('YouTube Premium', 'https://cdn.brandfetch.io/idVfYwcuQz/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Ad-free YouTube and music streaming service', 'https://www.youtube.com/premium', 'Entertainment', 'https://support.google.com/youtube/answer/6308278?hl=en'),
  ('Audible', 'https://cdn.brandfetch.io/idT82q9yNb/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Audiobook and spoken word entertainment service', 'https://www.audible.com', 'Books', 'https://www.audible.com/howtolisten'),
  ('Patreon', 'https://cdn.brandfetch.io/id5ZYO6A-6/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Membership platform for creators', 'https://www.patreon.com', 'Crowdfunding', 'https://support.patreon.com/hc/en-us/articles/204605915-How-do-I-cancel-my-membership-'),
  ('Epic Games Store', 'https://cdn.brandfetch.io/idjxHPThVp/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Digital video game storefront', 'https://www.epicgames.com/store', 'Gaming', 'https://www.epicgames.com/help/en-US/epic-games-store-c73/general-support-c90/how-do-i-cancel-my-epic-games-store-subscription-a10494'),
  ('Crunchyroll', 'https://cdn.brandfetch.io/id0XKwSDEq/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Streaming service for anime and manga', 'https://www.crunchyroll.com', 'Entertainment', 'https://help.crunchyroll.com/hc/en-us/articles/204537309-How-do-I-cancel-my-membership-'),
  ('Xbox Game Pass', 'https://cdn.brandfetch.io/idGE1UVbiU/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Subscription service for Xbox games', 'https://www.xbox.com/game-pass', 'Gaming', 'https://support.xbox.com/en-US/help/subscriptions-billing/manage-subscriptions/cancel-recurring-billing-or-subscription'),
  ('PlayStation Plus', 'https://cdn.brandfetch.io/idsn73YDWv/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Subscription service for PlayStation games', 'https://www.playstation.com/ps-plus', 'Gaming', 'https://www.playstation.com/en-us/support/subscriptions/cancel-playstation-plus/'),
  ('Sling TV', 'https://cdn.brandfetch.io/idzAifP7Tq/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Live TV streaming service', 'https://www.sling.com', 'Entertainment', 'https://www.sling.com/help/en/subscription-and-billing/canceling-your-sling-tv-subscription'),
  ('Dropbox', 'https://cdn.brandfetch.io/idY3kwH_Nx/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Cloud storage service', 'https://www.dropbox.com', 'Productivity', 'https://help.dropbox.com/accounts-billing/cancellations-refunds/cancel-subscription'),
  ('Google One', 'https://static.cdnlogo.com/logos/g/22/google-one.svg', true, true, (SELECT id FROM user_id), 'Cloud storage service by Google', 'https://one.google.com', 'Productivity', 'https://support.google.com/googleone/answer/9156533?hl=en'),
  ('Apple TV+', 'https://static.cdnlogo.com/logos/a/75/apple-tv-plus.svg', true, true, (SELECT id FROM user_id), 'Streaming service for Apple original content', 'https://www.apple.com/apple-tv-plus', 'Entertainment', 'https://support.apple.com/en-us/HT202039'),
  ('Starz', 'https://cdn.brandfetch.io/id3xChfIA_/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Premium cable and streaming service', 'https://www.starz.com', 'Entertainment', 'https://support.starz.com/hc/en-us/articles/360001030087-How-do-I-cancel-my-subscription-'),
  ('Showtime', 'https://cdn.brandfetch.io/id3MsPaRdF/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Premium cable and streaming service', 'https://www.showtime.com', 'Entertainment', 'https://help.showtime.com/hc/en-us/articles/360022523334-How-do-I-cancel-my-SHOWTIME-streaming-service-subscription-'),
  ('Paramount+', 'https://static.cdnlogo.com/logos/p/26/paramount.png', true, true, (SELECT id FROM user_id), 'Streaming service for Paramount content', 'https://www.paramountplus.com', 'Entertainment', 'https://help.paramountplus.com/s/article/PD-How-do-I-cancel-my-Paramount-subscription'),
  ('AMC+', 'https://static.cdnlogo.com/logos/a/79/amc.svg', true, true, (SELECT id FROM user_id), 'Streaming service for AMC content', 'https://www.amcplus.com', 'Entertainment', 'https://www.amcplus.com/help/cancel-subscription'),
  ('Adobe Creative Cloud', 'https://cdn.brandfetch.io/idkrQGARPW/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Suite of creative software applications', 'https://www.adobe.com/creativecloud', 'Productivity', 'https://helpx.adobe.com/manage-account/using/cancel-subscription.html'),
  ('Microsoft 365', 'https://cdn.brandfetch.io/idsWBrtc_i/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id), 'Subscription service for Microsoft Office applications', 'https://www.microsoft.com/microsoft-365', 'Productivity', 'https://support.microsoft.com/en-us/office/cancel-a-microsoft-subscription-b1bc0ad0-0b3a-48cf-b3ba-f3c5d744b1da');


WITH user_id AS (
    SELECT id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1
)
INSERT INTO public.payment_provider (name, description, icon, is_default, is_public, owner) 
VALUES
  ('Visa', 'Visa credit/debit cards', 'https://cdn.brandfetch.io/idhem73aId/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id)),
  ('Mastercard', 'Mastercard credit/debit cards', 'https://cdn.brandfetch.io/idFw8DodCr/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id)),
  ('American Express', 'American Express credit cards', 'https://cdn.brandfetch.io/id5WXF6Iyd/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id)),
  ('PayPal', 'PayPal digital payments', 'https://cdn.brandfetch.io/id-Wd4a4TS/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id)),
  ('Apple Pay', 'Apple Pay digital wallet', 'https://static.cdnlogo.com/logos/a/72/apple-pay.svg', true, true, (SELECT id FROM user_id)),
  ('Google Pay', 'Google Pay digital wallet', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTEyIDIwNCI+CiAgPHBhdGggZmlsbD0iIzVGNjM2OCIgZD0iTTM2Mi45MjcgNTUuMDU3YzE0LjA3NSAwIDI0Ljk1MiAzLjgzOSAzMy4yNyAxMS41MTdjOC4zMTcgNy42NzcgMTIuMTU1IDE3LjkxNCAxMi4xNTUgMzAuNzF2NjEuNDJoLTE3LjkxNFYxNDQuNjNoLS42NGMtNy42NzcgMTEuNTE3LTE4LjU1NCAxNy4yNzUtMzEuMzUgMTcuMjc1Yy0xMC44NzcgMC0yMC40NzQtMy4yLTI4LjE1MS05LjU5N2MtNy4wMzgtNi4zOTgtMTEuNTE3LTE1LjM1NS0xMS41MTctMjQuOTUyYzAtMTAuMjM3IDMuODQtMTguNTU1IDExLjUxNy0yNC45NTNzMTguNTU0LTguOTU3IDMxLjM1LTguOTU3YzExLjUxNiAwIDIwLjQ3NCAxLjkyIDI3LjUxMSA2LjM5OHYtNC40NzhjMC01Ljk3Mi0yLjIyOS0xMS45NDMtNi42ODgtMTUuODM0bC0uOTktLjgwMWMtNS4xMTgtNC40NzktMTEuNTE2LTcuMDM4LTE4LjU1My03LjAzOGMtMTAuODc3IDAtMTkuMTk0IDQuNDc5LTI0Ljk1MyAxMy40MzZMMzIxLjM0IDc0Ljg5YzEwLjIzNi0xMy40MzYgMjMuNjcyLTE5LjgzNCA0MS41ODctMTkuODM0Wm0tOTAuMjEyLTQzLjUwNmMxMS40OCAwIDIyLjM5IDMuOTk1IDMxLjExMyAxMS40NDVsMS41MTcgMS4zNWM4Ljk1NyA3LjY3OCAxMy40MzUgMTkuMTk1IDEzLjQzNSAzMS4zNTFjMCAxMi4xNTYtNC40NzggMjMuMDMzLTEzLjQzNSAzMS4zNWMtOC45NTggOC4zMTgtMTkuODM0IDEyLjc5Ni0zMi42MyAxMi43OTZsLTMwLjcxLS42NHY1OS41MDJIMjIyLjgxVjExLjU1aDQ5LjkwNVptOTIuNzcgOTcuMjVjLTcuNjc3IDAtMTQuMDc1IDEuOTE5LTE5LjE5MyA1Ljc1OGMtNS4xMTkgMy4xOTktNy42NzggNy42NzctNy42NzggMTMuNDM1YzAgNS4xMTkgMi41NiA5LjU5NyA2LjM5OCAxMi4xNTdjNC40NzkgMy4xOTkgOS41OTcgNS4xMTggMTQuNzE2IDUuMTE4YzcuMTY1IDAgMTQuMzMxLTIuNzg3IDE5LjkzNi03Ljg0bDEuMTc3LTEuMTE3YzYuMzk4LTUuNzU4IDkuNTk3LTEyLjc5NiA5LjU5Ny0yMC40NzRjLTUuNzU4LTQuNDc4LTE0LjA3Ni03LjAzOC0yNC45NTItNy4wMzhabS05MS40OS03OS4zMzZoLTMxLjk5VjgwLjY1aDMxLjk5YzcuMDM3IDAgMTQuMDc1LTIuNTU5IDE4LjU1NC03LjY3N2MxMC4yMzYtOS41OTcgMTAuMjM2LTI1LjU5Mi42NC0zNS4xOWwtLjY0LS42NGMtNS4xMTktNS4xMTgtMTEuNTE3LTguMzE3LTE4LjU1NS03LjY3N1pNNTEyIDU4LjI1NmwtNjMuMzQgMTQ1LjIzNWgtMTkuMTk0bDIzLjY3Mi01MC41NDRsLTQxLjU4Ny05NC4wNTFoMjAuNDc0bDMwLjA3IDcyLjI5N2guNjRsMjkuNDMxLTcyLjI5N0g1MTJ2LS42NFoiLz4KICA8cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNMTY1Ljg2OCA4Ni40MDdjMC01Ljc1OC0uNjQtMTEuNTE2LTEuMjgtMTcuMjc0SDg0LjYxNXYzMi42M2g0NS40MjVjLTEuOTE5IDEwLjIzNi03LjY3NyAxOS44MzMtMTYuNjM0IDI1LjU5MnYyMS4xMTNoMjcuNTExYzE1Ljk5NS0xNC43MTUgMjQuOTUyLTM2LjQ2OSAyNC45NTItNjIuMDZaIi8+CiAgPHBhdGggZmlsbD0iIzM0QTg1MyIgZD0iTTg0LjYxNCAxNjguOTQyYzIzLjAzMiAwIDQyLjIyNi03LjY3OCA1Ni4zMDItMjAuNDc0bC0yNy41MTEtMjEuMTEzYy03LjY3OCA1LjExOC0xNy4yNzUgOC4zMTctMjguNzkxIDguMzE3Yy0yMS43NTQgMC00MC45NDgtMTQuNzE1LTQ3LjM0Ni0zNS4xODlIOS4xMTh2MjEuNzUzYzE0LjcxNSAyOC43OTEgNDMuNTA2IDQ2LjcwNiA3NS40OTYgNDYuNzA2WiIvPgogIDxwYXRoIGZpbGw9IiNGQkJDMDQiIGQ9Ik0zNy4yNjggMTAwLjQ4M2MtMy44MzgtMTAuMjM3LTMuODM4LTIxLjc1MyAwLTMyLjYzVjQ2LjFIOS4xMThjLTEyLjE1NyAyMy42NzMtMTIuMTU3IDUxLjgyNCAwIDc2LjEzNmwyOC4xNS0yMS43NTNaIi8+CiAgPHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTg0LjYxNCAzMy4zMDRjMTIuMTU2IDAgMjMuNjcyIDQuNDc5IDMyLjYzIDEyLjc5NmwyNC4zMTItMjQuMzEyQzEyNi4yIDcuNzEyIDEwNS43MjctLjYwNSA4NS4yNTMuMDM0Yy0zMS45OSAwLTYxLjQyIDE3LjkxNS03NS40OTYgNDYuNzA2bDI4LjE1MSAyMS43NTNjNS43NTgtMjAuNDc0IDI0Ljk1Mi0zNS4xODkgNDYuNzA2LTM1LjE4OVoiLz4KPC9zdmc+', true, true, (SELECT id FROM user_id)),
  ('Amazon Pay', 'Amazon Pay digital payments', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTE0LjM3OCA0Ljk5NWMtLjM3My0uMzIzLS45NTMtLjQ4NS0xLjc0LS40ODVjLS4zOSAwLS43NzkuMDM2LTEuMTY4LjEwNmMtLjM5LjA3LS43MTguMTYzLS45ODMuMjhhLjQ3NC40NzQgMCAwIDAtLjE5OS4xM2MtLjAzMy4wNDUtLjA1LjEyNi0uMDUuMjQydi4zMzVjMCAuMTUuMDU0LjIyNC4xNjIuMjI0YS4zMzcuMzM3IDAgMCAwIC4xMDYtLjAxOWwuMDkzLS4wM2E2LjM5MiA2LjM5MiAwIDAgMSAxLjgyNy0uMjg3Yy40OTcgMCAuODQ1LjA5MiAxLjA0NS4yNzRjLjE5OS4xODMuMjk4LjQ5Ny4yOTguOTQ1di44MmE2LjY5NyA2LjY5NyAwIDAgMC0xLjU2Ny0uMjExYy0uNzI5IDAtMS4zMDkuMTgtMS43NC41NGMtLjQzLjM2LS42NDYuODQ0LS42NDYgMS40NDhjMCAuNTY1LjE3NCAxLjAxMy41MjIgMS4zNWMuMzQ4LjMzNS44Mi41MDIgMS40MTcuNTAyYy4zNTYgMCAuNzE0LS4wNyAxLjA3NS0uMjFjLjM2MS0uMTQxLjY5LS4zNC45ODgtLjU5N2wuMDYzLjQxYy4wMjUuMTU3LjExNi4yMzYuMjc0LjIzNmguNTM0Yy4xNjUgMCAuMjQ5LS4wODMuMjQ5LS4yNDlWNi41YzAtLjY4LS4xODctMS4xODEtLjU2LTEuNTA0em0tLjYwOSA0LjZjLS4yNzMuMjA3LS41Ni4zNjQtLjg1OC40NzJhMi41MTcgMi41MTcgMCAwIDEtLjg1Ny4xNjJjLS4zMjMgMC0uNTcyLS4wODUtLjc0Ni0uMjU1Yy0uMTc0LS4xNy0uMjYxLS40MTItLjI2MS0uNzI3YzAtLjcyMS40NjgtMS4wODIgMS40MDQtMS4wODJjLjIxNiAwIC40MzcuMDE1LjY2NS4wNDRjLjIyOC4wMy40NDYuMDY5LjY1My4xMTh6TTguNzczIDYuNDAyYTMuMDE2IDMuMDE2IDAgMCAwLS41MTYtMS4wMjZhMi4yMjUgMi4yMjUgMCAwIDAtLjgyLS42NDZhMi41NDcgMi41NDcgMCAwIDAtMS4wODItLjIyNGMtLjM3MyAwLS43MzguMDctMS4wOTQuMjExYTMuNTA0IDMuNTA0IDAgMCAwLTEuMDA3LjYyMmwtLjA2Mi0uMzk4Yy0uMDI1LS4xNjYtLjEyLS4yNDktLjI4Ni0uMjQ5aC0uNTQ3Yy0uMTY2IDAtLjI0OS4wODMtLjI0OS4yNDl2OC4zNjZjMCAuMTY2LjA4My4yNDguMjQ5LjI0OGguNzMzYy4xNjYgMCAuMjQ5LS4wODMuMjQ5LS4yNDh2LTIuOTA5YTIuNzcgMi43NyAwIDAgMCAxLjkyNi43MzRjLjQwNiAwIC43NzUtLjA4MSAxLjEwNi0uMjQyYTIuNDQgMi40NCAwIDAgMCAuODQ1LS42NzhjLjIzMy0uMjkuNDEzLS42NDIuNTQtMS4wNTdhNC42OSA0LjY5IDAgMCAwIC4xOTQtMS4zOTJhNC43MTYgNC43MTYgMCAwIDAtLjE4LTEuMzYxem0tMi43OTEgMy43MzVjLS41NjQgMC0xLjExMS0uMTk5LTEuNjQtLjU5N1Y2LjA3MmMuNTItLjM4IDEuMDc2LS41NzEgMS42NjUtLjU3MWMxLjEyNyAwIDEuNjkuNzc1IDEuNjkgMi4zMjRjMCAxLjU0Mi0uNTcyIDIuMzEyLTEuNzE1IDIuMzEyem0xMyAxLjk2M2wyLjczNi02Ljk2MWEuOTU3Ljk1NyAwIDAgMCAuMDg2LS4yOTljMC0uMDk5LS4wNTgtLjE0OS0uMTc0LS4xNDloLS42OTZjLS4xMzMgMC0uMjIzLjAyMS0uMjc0LjA2M2MtLjA1LjA0MS0uMDk5LjEzMy0uMTQ5LjI3NEwxOC44MzMgOS44NWwtMS43NC00LjgyMmMtLjA1LS4xNDEtLjEtLjIzMy0uMTUtLjI3NGMtLjA1LS4wNDItLjE0LS4wNjMtLjI3NC0uMDYzaC0uNzQ2Yy0uMTE2IDAtLjE3NC4wNS0uMTc0LjE1YzAgLjA1Ny4wMy4xNTcuMDg3LjI5OGwyLjQgNS45MTdsLS4yMzcuNjM0Yy0uMTQuMzk4LS4yOTguNjcxLS40NzIuODJjLS4xNzQuMTUtLjQxOS4yMjQtLjczMy4yMjRjLS4xNDEgMC0uMjUzLS4wMDktLjMzNi0uMDI1YTEuMDkzIDEuMDkzIDAgMCAwLS4xODYtLjAyNWMtLjEyNCAwLS4xODcuMDc5LS4xODcuMjM2di4zMjNjMCAuMTE2LjAyLjIwMS4wNjMuMjU1YS4zNTguMzU4IDAgMCAwIC4xOTkuMTE4Yy4yMDYuMDU3LjQ0My4wODcuNzA4LjA4N2MuNDczIDAgLjg1Ni0uMTI0IDEuMTUtLjM3M2MuMjk1LS4yNDguNTU0LS42NTguNzc4LTEuMjNtMi43MSA0LjQyM2MtMi42MjcgMS45NC02LjQzNiAyLjk3LTkuNzE3IDIuOTdjLTQuNTk3IDAtOC43MzctMS42OTktMTEuODctNC41MjhjLS4yNDYtLjIyMi0uMDI3LS41MjUuMjctLjM1M2MzLjM4IDEuOTY3IDcuNTU5IDMuMTUxIDExLjg3NiAzLjE1MWEyMy42MyAyMy42MyAwIDAgMCA5LjA2LTEuODUzYy40NDQtLjE5LjgxNi4yOTIuMzgyLjYxM20xLjA5My0xLjI0OGMuMzM2LjQzLS4zNzQgMi4yMDQtLjY5MSAyLjk5NmMtLjA5Ni4yNC4xMS4zMzYuMzI3LjE1NWMxLjQxLTEuMTggMS43NzQtMy42NSAxLjQ4NS00LjAwN2MtLjI4Ni0uMzU0LTIuNzUtLjY1OS00LjI1NC4zOTdjLS4yMzIuMTYzLS4xOTIuMzg3LjA2NC4zNTZjLjg0Ny0uMTAxIDIuNzMzLS4zMjggMy4wNjkuMTAzWiIvPgo8L3N2Zz4=', true, true, (SELECT id FROM user_id)),
  ('PayPal', 'PayPal digital payments', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjU2IDMwMiI+CiAgPHBhdGggZmlsbD0iIzI3MzQ2QSIgZD0iTTIxNy4xNjggMjMuNTA3QzIwMy4yMzQgNy42MjUgMTc4LjA0Ni44MTYgMTQ1LjgyMy44MTZoLTkzLjUyQTEzLjM5MyAxMy4zOTMgMCAwIDAgMzkuMDc2IDEyLjExTC4xMzYgMjU5LjA3N2MtLjc3NCA0Ljg3IDIuOTk3IDkuMjggNy45MzMgOS4yOGg1Ny43MzZsMTQuNS05MS45NzFsLS40NSAyLjg4YzEuMDMzLTYuNTAxIDYuNTkzLTExLjI5NiAxMy4xNzctMTEuMjk2aDI3LjQzNmM1My44OTggMCA5Ni4xMDEtMjEuODkyIDEwOC40MjktODUuMjIxYy4zNjYtMS44NzMuNjgzLTMuNjk2Ljk1Ny01LjQ3N2MtMS41NTYtLjgyNC0xLjU1Ni0uODI0IDAgMGMzLjY3MS0yMy40MDctLjAyNS0zOS4zNC0xMi42ODYtNTMuNzY1Ii8+CiAgPHBhdGggZmlsbD0iIzI3MzQ2QSIgZD0iTTEwMi4zOTcgNjguODRhMTEuNzM3IDExLjczNyAwIDAgMSA1LjA1My0xLjE0aDczLjMxOGM4LjY4MiAwIDE2Ljc4LjU2NSAyNC4xOCAxLjc1NmExMDEuNiAxMDEuNiAwIDAgMSA2LjE3NyAxLjE4MmE4OS45MjggODkuOTI4IDAgMCAxIDguNTkgMi4zNDdjMy42MzggMS4yMTUgNy4wMjYgMi42MyAxMC4xNCA0LjI4N2MzLjY3LTIzLjQxNi0uMDI2LTM5LjM0LTEyLjY4Ny01My43NjVDMjAzLjIyNiA3LjYyNSAxNzguMDQ2LjgxNiAxNDUuODIzLjgxNkg1Mi4yOTVDNDUuNzEuODE2IDQwLjEwOCA1LjYxIDM5LjA3NiAxMi4xMUwuMTM2IDI1OS4wNjhjLS43NzQgNC44NzggMi45OTcgOS4yODIgNy45MjUgOS4yODJoNTcuNzQ0TDk1Ljg4OCA3Ny41OGExMS43MTcgMTEuNzE3IDAgMCAxIDYuNTA5LTguNzRaIi8+CiAgPHBhdGggZmlsbD0iIzI3OTBDMyIgZD0iTTIyOC44OTcgODIuNzQ5Yy0xMi4zMjggNjMuMzItNTQuNTMgODUuMjIxLTEwOC40MjkgODUuMjIxSDkzLjAyNGMtNi41ODQgMC0xMi4xNDUgNC43OTUtMTMuMTY4IDExLjI5Nkw2MS44MTcgMjkzLjYyMWMtLjY3NCA0LjI2MiAyLjYyMiA4LjEyNCA2LjkzNCA4LjEyNGg0OC42N2ExMS43MSAxMS43MSAwIDAgMCAxMS41NjMtOS44OGwuNDc0LTIuNDhsOS4xNzMtNTguMTM2bC41OTEtMy4yMTNhMTEuNzEgMTEuNzEgMCAwIDEgMTEuNTYyLTkuODhoNy4yODRjNDcuMTQ3IDAgODQuMDY0LTE5LjE1NCA5NC44NTItNzQuNTVjNC41MDMtMjMuMTUgMi4xNzMtNDIuNDc4LTkuNzM5LTU2LjA1NGMtMy42MTMtNC4xMTItOC4xLTcuNTA4LTEzLjMyNy0xMC4yOGMtLjI4MyAxLjc5LS41OSAzLjYwNC0uOTU3IDUuNDc3WiIvPgogIDxwYXRoIGZpbGw9IiMxRjI2NEYiIGQ9Ik0yMTYuOTUyIDcyLjEyOGE4OS45MjggODkuOTI4IDAgMCAwLTUuODE4LTEuNDlhMTA5LjkwNCAxMDkuOTA0IDAgMCAwLTYuMTc3LTEuMTc0Yy03LjQwOC0xLjE5OS0xNS41LTEuNzY1LTI0LjE5LTEuNzY1aC03My4zMDlhMTEuNTcgMTEuNTcgMCAwIDAtNS4wNTMgMS4xNDlhMTEuNjgzIDExLjY4MyAwIDAgMC02LjUxIDguNzRsLTE1LjU4MiA5OC43OThsLS40NSAyLjg4YzEuMDI1LTYuNTAxIDYuNTg1LTExLjI5NiAxMy4xNy0xMS4yOTZoMjcuNDQ0YzUzLjg5OCAwIDk2LjEtMjEuODkyIDEwOC40MjgtODUuMjIxYy4zNjctMS44NzMuNjc1LTMuNjg4Ljk1OC01LjQ3N2MtMy4xMjItMS42NDgtNi41MDEtMy4wNzItMTAuMTQtNC4yNzlhODMuMjYgODMuMjYgMCAwIDAtMi43Ny0uODY1Ii8+Cjwvc3ZnPg==', true, true, (SELECT id FROM user_id)),
  ('Stripe', 'Stripe digital payments', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTEyIDIxNCI+CiAgPHBhdGggZmlsbD0iIzYzNUJGRiIgZD0iTTUxMiAxMTAuMDhjMC0zNi40MDktMTcuNjM2LTY1LjEzOC01MS4zNDItNjUuMTM4Yy0zMy44NSAwLTU0LjMzIDI4LjczLTU0LjMzIDY0Ljg1NGMwIDQyLjgwOCAyNC4xNzkgNjQuNDI2IDU4Ljg4IDY0LjQyNmMxNi45MjUgMCAyOS43MjUtMy44NCAzOS4zOTYtOS4yNDR2LTI4LjQ0NWMtOS42NyA0LjgzNi0yMC43NjQgNy44MjMtMzQuODQ0IDcuODIzYy0xMy43OTYgMC0yNi4wMjctNC44MzYtMjcuNTkxLTIxLjYxOGg2OS41NDdjMC0xLjg1LjI4NC05LjI0NS4yODQtMTIuNjU4Wm0tNzAuMjU4LTEzLjUxMWMwLTE2LjA3MSA5LjgxNC0yMi43NTYgMTguNzc0LTIyLjc1NmM4LjY3NSAwIDE3LjkyIDYuNjg1IDE3LjkyIDIyLjc1NmgtMzYuNjk0Wm0tOTAuMzEtNTEuNjI3Yy0xMy45MzkgMC0yMi44OTkgNi41NDItMjcuODc2IDExLjA5NGwtMS44NS04LjgxOGgtMzEuMjg4djE2NS44M2wzNS41NTUtNy41MzdsLjE0My00MC4yNDljNS4xMiAzLjY5OCAxMi42NTcgOC45NiAyNS4xNzMgOC45NmMyNS40NTggMCA0OC42NC0yMC40OCA0OC42NC02NS41NjRjLS4xNDItNDEuMjQ1LTIzLjYwOS02My43MTYtNDguNDk4LTYzLjcxNlptLTguNTM0IDk3Ljk5MWMtOC4zOTEgMC0xMy4zNy0yLjk4Ni0xNi43ODItNi42ODRsLS4xNDMtNTIuNzY1YzMuNjk4LTQuMTI0IDguODE4LTYuOTY4IDE2LjkyNS02Ljk2OGMxMi45NDIgMCAyMS45MDIgMTQuNTA2IDIxLjkwMiAzMy4xMzdjMCAxOS4wNTgtOC44MTggMzMuMjgtMjEuOTAyIDMzLjI4Wk0yNDEuNDkzIDM2LjU1MWwzNS42OTgtNy42OFYwbC0zNS42OTggNy41MzhWMzYuNTVabTAgMTAuODA5aDM1LjY5OHYxMjQuNDQ0aC0zNS42OThWNDcuMzZabS0zOC4yNTcgMTAuNTI0TDIwMC45NiA0Ny4zNmgtMzAuNzJ2MTI0LjQ0NGgzNS41NTZWODcuNDY3YzguMzktMTAuOTUxIDIyLjYxMy04Ljk2IDI3LjAyMi03LjM5NlY0Ny4zNmMtNC41NTEtMS43MDctMjEuMTkxLTQuODM2LTI5LjU4MiAxMC41MjRabS03MS4xMTItNDEuMzg2bC0zNC43MDIgNy4zOTVsLS4xNDIgMTEzLjkyYzAgMjEuMDUgMTUuNzg3IDM2LjU1MSAzNi44MzYgMzYuNTUxYzExLjY2MiAwIDIwLjE5NS0yLjEzMyAyNC44ODgtNC42OTNWMTQwLjhjLTQuNTUgMS44NDktMjcuMDIyIDguMzkxLTI3LjAyMi0xMi42NThWNzcuNjUzaDI3LjAyMlY0Ny4zNmgtMjcuMDIybC4xNDItMzAuODYyWk0zNS45ODIgODMuNDg0YzAtNS41NDYgNC41NTEtNy42OCAxMi4wOS03LjY4YzEwLjgwOCAwIDI0LjQ2MSAzLjI3MiAzNS4yNyA5LjEwM1Y1MS40ODRjLTExLjgwNC00LjY5My0yMy40NjYtNi41NDItMzUuMjctNi41NDJDMTkuMiA0NC45NDIgMCA2MC4wMTggMCA4NS4xOTJjMCAzOS4yNTIgNTQuMDQ0IDMyLjk5NSA1NC4wNDQgNDkuOTJjMCA2LjU0MS01LjY4OCA4LjY3NS0xMy42NTMgOC42NzVjLTExLjgwNCAwLTI2Ljg4LTQuODM2LTM4LjgyNy0xMS4zNzh2MzMuODQ5YzEzLjIyNyA1LjY4OSAyNi41OTYgOC4xMDYgMzguODI3IDguMTA2YzI5LjU4MiAwIDQ5LjkyLTE0LjY0OCA0OS45Mi00MC4xMDZjLS4xNDItNDIuMzgyLTU0LjMyOS0zNC44NDUtNTQuMzI5LTUwLjc3NFoiLz4KPC9zdmc+', true, true, (SELECT id FROM user_id)),
  ('Square', 'Square digital payments', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTQuMDEgMEE0LjAxIDQuMDEgMCAwIDAgMCA0LjAxdjE1Ljk4YzAgMi4yMSAxLjggNCA0LjAxIDQuMDFoMTUuOThDMjIuMiAyNCAyNCAyMi4yIDI0IDE5Ljk5VjRhNC4wMSA0LjAxIDAgMCAwLTQuMDEtNEg0em0xLjYyIDQuMzZoMTIuNzRjLjcgMCAxLjI2LjU3IDEuMjYgMS4yN3YxMi43NGMwIC43LS41NiAxLjI3LTEuMjYgMS4yN0g1LjYzYy0uNyAwLTEuMjYtLjU3LTEuMjYtMS4yN1Y1LjYzYTEuMjcgMS4yNyAwIDAgMSAxLjI2LTEuMjd6bTMuODMgNC4zNWEuNzMuNzMgMCAwIDAtLjczLjczdjUuMDljMCAuNC4zMi43Mi43Mi43Mmg1LjFhLjczLjczIDAgMCAwIC43My0uNzJWOS40NGEuNzMuNzMgMCAwIDAtLjczLS43M2gtNS4xWiIvPgo8L3N2Zz4=', true, true, (SELECT id FROM user_id)),
  ('Venmo', 'Venmo digital payments', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTE0IDMuMjdhNy40OSA3LjQ5IDAgMCAxIC42NiAzLjM1YzAgMi43Mi0xLjkzIDYuNzItMy40OSA5LjI3TDkuNTMgMi40NGwtNi45MS42NUw1Ljc5IDIyaDcuODhjMy40NS00LjU0IDcuNzEtMTEgNy43MS0xNmE3LjMgNy4zIDAgMCAwLTEuMDYtNHoiLz4KPC9zdmc+', true, true, (SELECT id FROM user_id)),
  ('Zelle', 'Zelle digital payments', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTEzLjU1OSAyNGgtMi44NDFhLjQ4My40ODMgMCAwIDEtLjQ4My0uNDgzdi0yLjc2NUg1LjYzOGEuNjY3LjY2NyAwIDAgMS0uNjY2LS42NjZ2LTIuMjM0YS42Ny42NyAwIDAgMSAuMTQyLS40MTJsOC4xMzktMTAuMzgyaC03LjI1YS42NjcuNjY3IDAgMCAxLS42NjctLjY2N1YzLjkxNGMwLS4zNjcuMjk5LS42NjYuNjY2LS42NjZoNC4yM1YuNDgzYzAtLjI2Ni4yMTctLjQ4My40ODMtLjQ4M2gyLjg0MWMuMjY2IDAgLjQ4My4yMTcuNDgzLjQ4M3YyLjc2NWg0LjMyM2MuMzY3IDAgLjY2Ni4yOTkuNjY2LjY2NnYyLjEzN2EuNjcuNjcgMCAwIDEtLjE0MS40MWwtOC4xOSAxMC40ODFoNy42NjVjLjM2NyAwIC42NjYuMjk5LjY2Ni42NjZ2Mi40NzdhLjY2Ny42NjcgMCAwIDEtLjY2Ni42NjdoLTQuMzJ2Mi43NjVhLjQ4My40ODMgMCAwIDEtLjQ4My40ODNaIi8+Cjwvc3ZnPg==', true, true, (SELECT id FROM user_id)),
  ('Cash App', 'Cash App digital payments', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTIzLjU5IDMuNDc1YTUuMSA1LjEgMCAwIDAtMy4wNS0zLjA1Yy0xLjMxLS40Mi0yLjUtLjQyLTQuOTItLjQySDguMzZjLTIuNCAwLTMuNjEgMC00LjkuNGE1LjEgNS4xIDAgMCAwLTMuMDUgMy4wNkMwIDQuNzY1IDAgNS45NjUgMCA4LjM2NXY3LjI3YzAgMi40MSAwIDMuNi40IDQuOWE1LjEgNS4xIDAgMCAwIDMuMDUgMy4wNWMxLjMuNDEgMi41LjQxIDQuOS40MWg3LjI4YzIuNDEgMCAzLjYxIDAgNC45LS40YTUuMSA1LjEgMCAwIDAgMy4wNi0zLjA2Yy40MS0xLjMuNDEtMi41LjQxLTQuOXYtNy4yNWMwLTIuNDEgMC0zLjYxLS40MS00Ljkxem0tNi4xNyA0LjYzbC0uOTMuOTNhLjUuNSAwIDAgMS0uNjcuMDFhNSA1IDAgMCAwLTMuMjItMS4xOGMtLjk3IDAtMS45NC4zMi0xLjk0IDEuMjFjMCAuOSAxLjA0IDEuMiAyLjI0IDEuNjVjMi4xLjcgMy44NCAxLjU4IDMuODQgMy42NGMwIDIuMjQtMS43NCAzLjc4LTQuNTggMy45NWwtLjI2IDEuMmEuNDkuNDkgMCAwIDEtLjQ4LjM5SDkuNjNsLS4wOS0uMDFhLjUuNSAwIDAgMS0uMzgtLjU5bC4yOC0xLjI3YTYuNTQgNi41NCAwIDAgMS0yLjg4LTEuNTd2LS4wMWEuNDguNDggMCAwIDEgMC0uNjhsMS0uOTdhLjQ5LjQ5IDAgMCAxIC42NyAwYy45MS44NiAyLjEzIDEuMzQgMy4zOSAxLjMyYzEuMyAwIDIuMTctLjU1IDIuMTctMS40MmMwLS44Ny0uODgtMS4xLTIuNTQtMS43MmMtMS43Ni0uNjMtMy40My0xLjUyLTMuNDMtMy42YzAtMi40MiAyLjAxLTMuNiA0LjM5LTMuNzFsLjI1LTEuMjNhLjQ4LjQ4IDAgMCAxIC40OC0uMzhoMS43OGwuMS4wMWMuMjYuMDYuNDMuMzEuMzcuNTdsLS4yNyAxLjM3Yy45LjMgMS43NS43NyAyLjQ4IDEuMzlsLjAyLjAyYy4xOS4yLjE5LjUgMCAuNjh6Ii8+Cjwvc3ZnPg==', true, true, (SELECT id FROM user_id)),
  ('Samsung Pay', 'Samsung Pay digital wallet', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzIgMzIiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTMxLjk2OSAxNC4yNzFjLS4xNzctNS4xMDQtMS41MTYtOS4yMTQtNC41NDItMTEuNDU4UzE5Ljg1NC0uMjA4IDE0LjE0MS4wNjNjLTIuNTk5LjEyNS00LjkzOC40NjQtNi44MzkgMS4yMjRjLTEuOTU4Ljc4Ni0zLjQ3NCAxLjg5Ni00LjU4MyAzLjQzOEMuNDkgNy44MjQtLjE5OCAxMi41MDYuMDQ3IDE3Ljg5N2MuMjM0IDUuMTIgMS41NTcgOS4xNzIgNC42MiAxMS4zOGMzLjA0NyAyLjE5OCA3Ljk5NSAyLjg5NiAxMy4yMTQgMi42NzJjNS4wNjMtLjIxNCA5LjE3Ny0xLjU1MiAxMS4zOC00LjYyYzIuMTk4LTMuMDYzIDIuODk2LTcuNTc4IDIuNzA4LTEzLjA1N3pNOC44MDIgMTkuNjkzaC0uNjYxdi0xLjQxN2guNjYxYzEuMjYgMCAyLjE4Mi0uOTc0IDIuMTgyLTIuMTgyYTIuMTgxIDIuMTgxIDAgMCAwLTIuMTgyLTIuMTgyaC0yLjEzYS4xNzQuMTc0IDAgMCAwLS4xNjcuMTI1djcuNzM0SDUuMTN2LTcuNzM0YzAtLjg0OS42OTMtMS41NDIgMS41NDItMS41NDJoMi4xM2MxLjk5IDAgMy42MzUgMS42MTUgMy42MzUgMy41OTljMCAxLjk5LTEuNTM2IDMuNTk5LTMuNjM1IDMuNTk5em0xMS42MDQgMGgtMS4zOTFWMTUuOTljLS4wMzEtMS4wNDctMS4xNDEtMi4wODktMi4zMjMtMi4wODljLTEuMzI4IDAtMi4zMDIgMS4xMzUtMi4zMDIgMi4xOTNjMCAxLjUwNSAxLjA1NyAyLjE5MyAyLjMwMiAyLjE5M2guNDk1djEuNDA2aC0uNDk1Yy0yLjA0NyAwLTMuNzE0LTEuMzEzLTMuNzE0LTMuNTk5YzAtMS44NTkgMS42NjctMy41OTkgMy43MTQtMy41OTljMS44NTQgMCAzLjY1NiAxLjU1NyAzLjcxNCAzLjQ5NXptMS43NjYtNi45NTlsMS44MTMgMy43MTlsLS43ODYgMS41OTlsLTIuNTk5LTUuMzE4em0xLjY4MiA5LjI5MmgtMS41NzhsNC41NjgtOS4yOTJoMS41Nzh6Ii8+Cjwvc3ZnPg==', true, true, (SELECT id FROM user_id)),
  ('LG Pay', 'LG Pay digital wallet', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTUuMjg2IDYuNzE0YTUuMjg2IDUuMjg2IDAgMSAwIDAgMTAuNTcyYTUuMjg3IDUuMjg3IDAgMCAwIDAtMTAuNTcyem0wIC44NmMuMDUgMCAuMTU2IDAgLjIxLjAwMnYuNDEzYTE0LjYyMiAxNC42MjEgMCAwIDAtLjIxLS4wMDNBMy45ODYgMy45ODYgMCAwIDAgMi40NSA5LjE2MWEzLjk4MiAzLjk4MiAwIDAgMC0xLjE3NSAyLjgzNmMwIDEuMDcyLjQxNyAyLjA4IDEuMTc1IDIuODM2YTMuOTg2IDMuOTg2IDAgMCAwIDIuODM2IDEuMTc1YTQuMDIgNC4wMTkgMCAwIDAgNC4wMDMtMy43NDF2LS4wNkg2LjU1MXYtLjQxaDIuOTgxbC4xNzctLjAwMXYuMjAxYTQuMzk0IDQuMzk0IDAgMCAxLTEuMjk0IDMuMTI4YTQuNCA0LjQgMCAwIDEtMy4xMyAxLjI5NmMtMS4xOCAwLTIuMjktLjQ2LTMuMTMtMS4yOTZhNC4zOTQgNC4zOTQgMCAwIDEtMS4yOTMtMy4xMjhhNC40MyA0LjQzIDAgMCAxIDQuNDI0LTQuNDI1em0xNi4wNjMuODc4Yy0yLjIxIDAtMy4zNzIgMS4yMDctMy4zNzIgMy41MDhjMCAyLjI5IDEuMDUgMy41MyAzLjM2IDMuNTNjMS4wNiAwIDIuMDk5LS4yNyAyLjY2My0uNjY1di0zLjMxNmgtMi43NHYxLjI3NGgxLjI4NXYxLjE5NWMtLjIzNy4wOS0uNy4xODEtMS4xNC4xODFjLTEuNDIgMC0xLjg5NC0uNzIyLTEuODk0LTIuMTg4YzAtMS4zOTguNDUtMi4yMjIgMS44NzItMi4yMjJjLjc5IDAgMS4yNC4yNDggMS42MTMuNzIybC45ODItLjkwMmMtLjU5OC0uODU3LTEuNjQ3LTEuMTE3LTIuNjMtMS4xMTd6bS04LjQxMy4xMDJ2Ni44MzRoNC44NXYtMS4zM2gtMy4yN1Y4LjU1M3pNMy41OTggOS42NzdhLjYzNS42MzUgMCAxIDEgMCAxLjI3YS42MzUuNjM1IDAgMCAxIDAtMS4yN3ptMS40NzguMDAyaC40MnY0LjIyaDEuMDUydi40MTRINS4wNzZ6Ii8+Cjwvc3ZnPg==', true, true, (SELECT id FROM user_id)),
  ('Chase Pay', 'Chase Pay digital wallet', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzIgMzIiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTExLjQ1MyAzMS45NjRhLjk3OC45NzggMCAwIDEtLjQzOC0uMDg5YTEuNzU2IDEuNzU2IDAgMCAxLS4zNzUtLjIyOWMtLjExNS0uMDk0LS4xOTgtLjIwOC0uMjQ1LS4zNDlzLS4wODMtLjI5Ny0uMTA0LS40NThsLjAzNi03Ljg5NmgyMC44NTlsLTkuNDc5IDkuMDIxSDExLjQxNXpNMzIgMjAuNTQ3YTIuMDQ1IDIuMDQ1IDAgMCAxLS4xMDQuNDQzYS44Ny44NyAwIDAgMS0uMjUuMzQ5Yy0uMTE1LjEwOS0uMjQuMTg4LS4zNy4yNWExLjA2MyAxLjA2MyAwIDAgMS0uNDM4LjA4OWgtNy44OTZMMjIuOTA2Ljc3N2w5LjA1NyA5LjUxNnYxMC4yNTV6TTIwLjU0Ny4wMzZjLjE0MSAwIC4yODYuMDMxLjQ0My4wODljLjE1MS4wNTcuMjY2LjEzNS4zNDkuMjI5cy4xNjEuMjA4LjIyOS4zNTRhLjc1Ljc1IDAgMCAxIC4wNzMuNDUzbC4wMzEgNy44OTZILjc0TDEwLjI5Mi4wMzZ6TS4wMzYgMTEuNDUzYS42OS42OSAwIDAgMSAuMDY4LS40MzhjLjA3My0uMTMuMTU2LS4yNS4yNS0uMzU0cy4yMDgtLjE4OC4zNDktLjI0NWMuMTQ2LS4wNjMuMjg2LS4wODkuNDI3LS4wODloNy45MjdsLS4wMzYgMjAuODk2bC04Ljk4NC05LjUxNmwtLjAzNi0xMC4yNTV6Ii8+Cjwvc3ZnPg==', true, true, (SELECT id FROM user_id)),
  ('Wells Fargo Wallet', 'Wells Fargo Wallet digital wallet', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTEyLjEzNiAxMy45NDljMCAuMzkyLS4yNDUuNjE2LS43MTkuNjE2aC0uNjI4di0xLjIyNmguNjI4Yy40OCAwIC43Mi4yMTIuNzIuNjF6TTYuOTIyIDE1LjA2aDEuMDQ0bC0uNTIzLTEuNDQzem0xMi40Ni0xLjgyYy0uNzIgMC0xLjEwOS41NjItMS4xMDkgMS41MjZjMCAuOTcuMzg0IDEuNTI2IDEuMTA4IDEuNTI2Yy43MjUgMCAxLjEwOC0uNTU2IDEuMTA4LTEuNTI2YzAtLjk2NC0uMzg5LTEuNTI2LTEuMTA4LTEuNTI2ek0yMy43MyAwdjI0SC4yNjlWMHptLTUuNTQ4IDEwLjY1MmMuNDg0LjI0NS45NDguMzU0IDEuNTcxLjM1NGMuODk1IDAgMS40ODEtLjQ1OCAxLjQ4MS0xLjE3MWMwLS42LS4zNTctMS4wMTQtMS4wMjgtMS4xNzJsLS42NzctLjE1OGMtLjM5NC0uMDkyLS41NTktLjI1LS41NTktLjUxN2MwLS4zMjIuMjUtLjUyMy43NC0uNTIzcy43NzguMTguODkuNjA0bC4wNDguMTg2aC4zODN2LS45NDNhMi45MjcgMi45MjcgMCAwIDAtMS4zNTItLjMzOGMtLjkxMSAwLTEuNDk3LjQ0Ny0xLjQ5NyAxLjE2NmMwIC41NTYuMzQuOTY1Ljk5NiAxLjExMmwuNjc2LjE1MmMuNDMyLjA5OS41OTIuMjczLjU5Mi41NjJjMCAuMzU0LS4yNjEuNTUtLjc4NC41NWMtLjU5IDAtLjg5NC0uMjQtMS4wMjctLjY5N2wtLjA3LS4yMzVoLS4zODN6bS0zLjM3OC4yNDVoMy4wMlY5LjU5NWgtLjM4M2wtLjA0My4xOWMtLjEwNi40ODYtLjI1NS42MzgtLjYwNy42MzhoLS43NFY3LjU1N2guNTA2di0uNDc0aC0xLjc1M3YuNDc0aC40NTN2Mi44NjZoLS40NTN6bS0zLjM1NSAwaDMuMDJWOS41OTVoLS4zODRsLS4wNDIuMTljLS4xMDcuNDg2LS4yNTYuNjM4LS42MDguNjM4aC0uNzRWNy41NTdoLjUwNnYtLjQ3NEgxMS40NXYuNDc0aC40NTJ2Mi44NjZoLS40NTJ6bS04Ljc1OC0zLjM0bC45MzggMy4zNGguNzRsLjc3OC0yLjc2OGwuNzU2IDIuNzY4aC43NGwuOTMyLTMuMzRoLjczNnYyLjg2NmgtLjQ1M3YuNDc0aDMuMjAxVjkuNTk1aC0uMzgzbC0uMDQzLjE5Yy0uMTA2LjQ4Ni0uMjYuNjM4LS42MDcuNjM4aC0uOTIyVjkuMjQxaDEuMDcxYS41OC41OCAwIDAgMCAuMDU5LS4yNzNhLjU1LjU1IDAgMCAwLS4wNTktLjI2aC0xLjA3di0xLjE1aC44ODRjLjM1NyAwIC40OC4xNTcuNTk2LjYxNWwuMDM4LjE0N2guMzgzVjcuMDgzSDYuNDl2LjQ3NGguNTIybC0uNjEzIDIuMzA1bC0uNzYyLTIuNzc5aC0uNzY2bC0uNzQ2IDIuNzc0bC0uNjI0LTIuM2guNTAxdi0uNDc0SDIuMjY2di40NzRoLjQyNnptMS40MTIgNy4wMDJ2LTEuMjJoLjk0N2MuMzU4IDAgLjQ4LjE1OC41OTcuNjE1bC4wMzguMTQ3aC4zODN2LTEuMjM2SDIuODU3di40NzRoLjQ1M3YyLjg2NmgtLjQ1M3YuNDc0aDEuNzh2LS40NzRoLS41MzN2LTEuMTEySDUuMmEuNTguNTggMCAwIDAgLjA1OC0uMjcyYS41NTEuNTUxIDAgMCAwLS4wNTgtLjI2Mkg0LjEwNHptOS4xMTQgMS45MTNhLjQ2MS40NjEgMCAwIDAtLjA0OC0uMjI0YS42NjMuNjYzIDAgMCAxLS4xMTIuMDExYy0uMjQ1IDAtLjMwOS0uMTQyLS4zNC0uNDU4bC0uMDIyLS4yMDFjLS4wNDgtLjQzLS4yNDUtLjcwOC0uNzMtLjc0NnYtLjAxN2MuNDgtLjAyMi45NzUtLjM0OS45NzUtLjk2NGMwLS42MjEtLjQ5Ni0xLjAwOC0xLjI1Ny0xLjAwOEg5LjU0MnYuNDc0aC40NTN2Mi44NjZIOS4yNmwtMS4zMzItMy4zNEg3LjIybC0xLjMwNSAzLjM0aC0uMzczdi40NzRoMS40MTJ2LS40NzRoLS40NDhsLjI0NS0uNjgyaDEuMzg1bC4yNDUuNjgyaC0uNDM3di40NzRoMy4zNXYtLjQ3NGgtLjUwNXYtMS4xNmguMjkzYy41ODYgMCAuNzYxLjIxMi44MjYuNzYybC4wMi4xOWMuMDYuNTA3LjMxLjcyNS44MjYuNzI1Yy4xNSAwIC4yOTktLjAxLjQxNi0uMDI3YS40Ni40NiAwIDAgMCAuMDQ4LS4yMjN6bTMuNjMzLTEuNzg4aC0xLjQxN2EuNTIuNTIgMCAwIDAtLjA1OS4yNTZjMCAuMTEuMDE2LjE4LjA1OS4yNjhoLjYzNHYuOTY0YTEuNTk4IDEuNTk4IDAgMCAxLS42MjkuMTI1Yy0uNzY3IDAtMS4xNjYtLjU2LTEuMTY2LTEuNTNzLjQtMS41MzIgMS4xMjQtMS41MzJjLjQ4NSAwIC43NjcuMjQ1LjkzMi42N2wuMDU4LjE1M2guMzg0di0uOTc2YTMuMDYzIDMuMDYzIDAgMCAwLTEuNDEyLS4zMzdjLTEuMTcyIDAtMS45Ni44LTEuOTYgMi4wMjdjMCAxLjIzMS43NjcgMi4wMTYgMS45NiAyLjAxNmMuNDc0IDAgLjk2NC0uMTM2IDEuNDkyLS40MDR6bTQuNTEyLjA4MmMwLTEuMTgyLS44MzEtMi4wMjEtMS45ODItMi4wMjFjLTEuMTQ1IDAtMS45ODEuODM5LTEuOTgxIDIuMDIxYzAgMS4xODguODMgMi4wMjIgMS45ODEgMi4wMjJjMS4xNTYgMCAxLjk4Mi0uODM0IDEuOTgyLTIuMDIyIi8+Cjwvc3ZnPg==', true, true, (SELECT id FROM user_id)),
  ('Capital One Wallet', 'Capital One Wallet digital wallet', 'https://cdn.brandfetch.io/idYFfMZte4/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', true, true, (SELECT id FROM user_id)),
  ('Citi Wallet', 'Citi Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Bank of America Wallet', 'Bank of America Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('US Bank Wallet', 'US Bank Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('PNC Wallet', 'PNC Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('TD Bank Wallet', 'TD Bank Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('BB&T Wallet', 'BB&T Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('SunTrust Wallet', 'SunTrust Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Fifth Third Wallet', 'Fifth Third Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Ally Wallet', 'Ally Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Discover Wallet', 'Discover Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Navy Federal Wallet', 'Navy Federal Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Charles Schwab Wallet', 'Charles Schwab Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Robinhood Wallet', 'Robinhood Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Wealthfront Wallet', 'Wealthfront Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Betterment Wallet', 'Betterment Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Acorns Wallet', 'Acorns Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Stash Wallet', 'Stash Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Chime Wallet', 'Chime Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Varo Wallet', 'Varo Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Simple Wallet', 'Simple Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('SoFi Wallet', 'SoFi Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('N26 Wallet', 'N26 Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Revolut Wallet', 'Revolut Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Monzo Wallet', 'Monzo Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Starling Wallet', 'Starling Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('TransferWise Wallet', 'TransferWise Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Wise Wallet', 'Wise Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Payoneer Wallet', 'Payoneer Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Skrill Wallet', 'Skrill Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Neteller Wallet', 'Neteller Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('WebMoney Wallet', 'WebMoney Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Perfect Money Wallet', 'Perfect Money Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Payeer Wallet', 'Payeer Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('AdvCash Wallet', 'AdvCash Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id)),
  ('Yandex Money Wallet', 'Yandex Money Wallet digital wallet', 'data:image/svg+xml;base64,...', true, true, (SELECT id FROM user_id));