-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Create trigger to run the function when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create default organization for demo purposes
INSERT INTO public.organizations (id, name, min_profit_margin)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization', 35.0)
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles to have the demo organization
UPDATE public.profiles 
SET organization_id = '550e8400-e29b-41d4-a716-446655440000' 
WHERE organization_id IS NULL;