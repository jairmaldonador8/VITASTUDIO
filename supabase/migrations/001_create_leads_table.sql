-- Create leads table for registration form
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  negocio TEXT NOT NULL,
  web TEXT,
  inversion TEXT,
  fundador TEXT,
  reto TEXT,
  ip_address INET,
  origen TEXT DEFAULT 'apply.html',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "allow_insert" ON public.leads;
CREATE POLICY "allow_insert" ON public.leads
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "read_own_leads" ON public.leads;
CREATE POLICY "read_own_leads" ON public.leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_negocio ON public.leads(negocio);

-- Grant permissions
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT ON public.leads TO authenticated;
