drop policy "preferences_delete_owned" on "public"."preferences";

drop policy "preferences_insert_with_owner" on "public"."preferences";

drop policy "preferences_select_owned_or_admin_ops" on "public"."preferences";

drop policy "preferences_update_owned" on "public"."preferences";

alter table "public"."preferences" drop constraint "preferences_pkey";

drop index if exists "public"."preferences_pkey";

create table "public"."preference_system_defaults" (
    "preference_key" text not null,
    "preference_description" text not null,
    "preference_data_type" text not null,
    "available_values" text[],
    "preference_value" text,
    "preference_jsonb" jsonb default '{}'::jsonb
);


alter table "public"."preference_system_defaults" enable row level security;

alter table "public"."preferences" drop column "available_values";

alter table "public"."preferences" drop column "data_type";

alter table "public"."preferences" drop column "id";

alter table "public"."preferences" drop column "title";

alter table "public"."preferences" add column "preference_jsonb" jsonb default '{}'::jsonb;

CREATE UNIQUE INDEX preference_system_defaults_pkey ON public.preference_system_defaults USING btree (preference_key);

CREATE UNIQUE INDEX preferences_pkey ON public.preferences USING btree (owner, preference_key);

alter table "public"."preference_system_defaults" add constraint "preference_system_defaults_pkey" PRIMARY KEY using index "preference_system_defaults_pkey";

alter table "public"."preferences" add constraint "preferences_pkey" PRIMARY KEY using index "preferences_pkey";

alter table "public"."preferences" add constraint "preferences_preference_key_fkey" FOREIGN KEY (preference_key) REFERENCES preference_system_defaults(preference_key) not valid;

alter table "public"."preferences" validate constraint "preferences_preference_key_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_initial_subscription_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO subscription_history (
        subscription_id,
        owner,
        state,
        start_date,
        created_by
    ) VALUES (
        NEW.id,
        NEW.owner,
        NEW.state,
        CURRENT_TIMESTAMP,
        auth.uid()
    );
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, created_at)
    VALUES (NEW.id, NOW());
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_subscription_state_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Only proceed if state actually changed
    IF OLD.state = NEW.state THEN
        RETURN NEW;
    END IF;

    -- Close the previous state
    UPDATE subscription_history
    SET end_date = CURRENT_TIMESTAMP
    WHERE subscription_id = NEW.id
    AND end_date IS NULL;

    -- Create new state record
    INSERT INTO subscription_history (
        subscription_id,
        owner,
        state,
        start_date,
        created_by
    ) VALUES (
        NEW.id,
        NEW.owner,
        NEW.state,
        CURRENT_TIMESTAMP,
        auth.uid()
    );

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."preference_system_defaults" to "anon";

grant insert on table "public"."preference_system_defaults" to "anon";

grant references on table "public"."preference_system_defaults" to "anon";

grant select on table "public"."preference_system_defaults" to "anon";

grant trigger on table "public"."preference_system_defaults" to "anon";

grant truncate on table "public"."preference_system_defaults" to "anon";

grant update on table "public"."preference_system_defaults" to "anon";

grant delete on table "public"."preference_system_defaults" to "authenticated";

grant insert on table "public"."preference_system_defaults" to "authenticated";

grant references on table "public"."preference_system_defaults" to "authenticated";

grant select on table "public"."preference_system_defaults" to "authenticated";

grant trigger on table "public"."preference_system_defaults" to "authenticated";

grant truncate on table "public"."preference_system_defaults" to "authenticated";

grant update on table "public"."preference_system_defaults" to "authenticated";

grant delete on table "public"."preference_system_defaults" to "service_role";

grant insert on table "public"."preference_system_defaults" to "service_role";

grant references on table "public"."preference_system_defaults" to "service_role";

grant select on table "public"."preference_system_defaults" to "service_role";

grant trigger on table "public"."preference_system_defaults" to "service_role";

grant truncate on table "public"."preference_system_defaults" to "service_role";

grant update on table "public"."preference_system_defaults" to "service_role";

create policy "Enable read access for all users"
on "public"."preference_system_defaults"
as permissive
for select
to public
using (true);


create policy "Enable delete for users based on user_id"
on "public"."preferences"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = owner));


create policy "Enable insert for authenticated users only"
on "public"."preferences"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable updates for users own records"
on "public"."preferences"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = owner))
with check ((( SELECT auth.uid() AS uid) = owner));


create policy "Enable users to view their own data only"
on "public"."preferences"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = owner));



