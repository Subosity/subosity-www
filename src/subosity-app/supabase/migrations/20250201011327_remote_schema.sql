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


