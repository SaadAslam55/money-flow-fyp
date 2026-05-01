-- Fix: Recreate the on_auth_user_created trigger
-- This trigger fires when a new auth user signs up and creates
-- a corresponding record in public.users and public.organizations

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_user_role user_role;
  v_org_name TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
    INSERT INTO public.organizations (name, email)
    VALUES ('Default Organization', NEW.email)
    RETURNING id INTO v_org_id;
    v_user_role := 'super_admin';
  ELSE
    v_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    v_user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer');
    IF v_org_id IS NULL THEN
      v_org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Business');
      INSERT INTO public.organizations (name, email)
      VALUES (v_org_name, NEW.email)
      RETURNING id INTO v_org_id;
      v_user_role := 'admin';
    END IF;
  END IF;

  INSERT INTO public.users (
    auth_user_id, organization_id, email,
    full_name, first_name, last_name, role, avatar_url
  ) VALUES (
    NEW.id, v_org_id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    v_user_role,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO invoice_settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
