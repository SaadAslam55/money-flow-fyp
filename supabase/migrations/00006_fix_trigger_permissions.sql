-- ============================================
-- FIX: handle_new_user trigger permissions
-- Problem: Function runs during auth signup when auth.uid() is NULL,
-- causing RLS policies to block the INSERT into organizations/users.
-- Solution: Set function owner to postgres (bypasses RLS) and
-- grant execute to supabase_auth_admin.
-- ============================================

-- Recreate the function with proper owner and security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_org_id UUID;
  v_user_role user_role;
  v_org_name TEXT;
BEGIN
  -- First user becomes super_admin with default org
  IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
    INSERT INTO public.organizations (name, email)
    VALUES ('Default Organization', NEW.email)
    RETURNING id INTO v_org_id;
    v_user_role := 'super_admin';
  ELSE
    -- Check if user was invited to an existing organization
    v_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    v_user_role := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'viewer'
    );

    -- No org specified: create a new one and make them admin
    IF v_org_id IS NULL THEN
      v_org_name := COALESCE(
        NEW.raw_user_meta_data->>'organization_name',
        'My Business'
      );
      INSERT INTO public.organizations (name, email)
      VALUES (v_org_name, NEW.email)
      RETURNING id INTO v_org_id;
      v_user_role := 'admin';
    END IF;
  END IF;

  -- Create the user record linked to the org
  INSERT INTO public.users (
    auth_user_id,
    organization_id,
    email,
    full_name,
    first_name,
    last_name,
    role,
    avatar_url
  ) VALUES (
    NEW.id,
    v_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    v_user_role,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default invoice settings for the new org
  INSERT INTO public.invoice_settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block signup
    RAISE WARNING 'handle_new_user failed: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Set owner to postgres so it bypasses RLS (postgres role has BYPASSRLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Revoke public execute, grant only to supabase_auth_admin
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also grant organizations INSERT to service role to be safe
GRANT INSERT ON public.organizations TO service_role;
GRANT INSERT ON public.users TO service_role;
GRANT INSERT ON public.invoice_settings TO service_role;
