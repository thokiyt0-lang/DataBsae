-- ========================================================
-- Supabase Database Testing Dashboard - Schema & RLS Setup
-- ========================================================
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the `records` table
CREATE TABLE IF NOT EXISTS public.records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive', 'Archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow public read access" ON public.records;
DROP POLICY IF EXISTS "Allow public insert access" ON public.records;
DROP POLICY IF EXISTS "Allow public update access" ON public.records;
DROP POLICY IF EXISTS "Allow public delete access" ON public.records;

-- 4. Create RLS Policies for full public testing access (or restrict to auth.uid() as needed)
CREATE POLICY "Allow public read access" 
    ON public.records FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert access" 
    ON public.records FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update access" 
    ON public.records FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete access" 
    ON public.records FOR DELETE 
    USING (true);

-- 5. Automatic trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_records_updated_at ON public.records;
CREATE TRIGGER tr_records_updated_at
    BEFORE UPDATE ON public.records
    FOR EACH ROW
    EXECUTE FUNCTION update_records_updated_at();

-- 6. Insert sample records for initial testing
INSERT INTO public.records (name, email, phone, address, status)
VALUES 
    ('Alexander Pierce', 'alexander.pierce@example.com', '+1 (555) 234-5678', '742 Evergreen Terrace, Springfield, OR', 'Active'),
    ('Samantha Vance', 'samantha.vance@techcorp.io', '+1 (555) 876-5432', '100 Silicon Way, San Francisco, CA', 'Active'),
    ('Marcus Brody', 'm.brody@museum.org', '+1 (555) 345-6789', '15 Audit Lane, Boston, MA', 'Pending'),
    ('Elena Rostova', 'elena.rostova@cyberdyn.com', '+1 (555) 901-2345', '88 Innovation Blvd, Austin, TX', 'Inactive')
ON CONFLICT (id) DO NOTHING;
