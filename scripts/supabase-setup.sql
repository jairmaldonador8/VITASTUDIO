-- Crear tabla leads
CREATE TABLE leads (
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

-- Habilitar Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política: permitir inserts (desde el API endpoint)
CREATE POLICY "allow_insert" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Política: solo usuarios autenticados pueden leer (opcional)
CREATE POLICY "read_own_leads" ON leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Crear índices para búsqueda rápida
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_negocio ON leads(negocio);

-- Comentarios
COMMENT ON TABLE leads IS 'Tabla de leads/registros del formulario apply.html';
COMMENT ON COLUMN leads.id IS 'ID único del lead';
COMMENT ON COLUMN leads.nombre IS 'Nombre del contacto';
COMMENT ON COLUMN leads.email IS 'Email del contacto';
COMMENT ON COLUMN leads.whatsapp IS 'Número WhatsApp (con +código país)';
COMMENT ON COLUMN leads.negocio IS 'Tipo/descripción del negocio';
COMMENT ON COLUMN leads.web IS 'Sitio web actual (opcional)';
COMMENT ON COLUMN leads.inversion IS 'Rango de inversión mensual en marketing';
COMMENT ON COLUMN leads.fundador IS 'Es fundador del negocio (Sí/No)';
COMMENT ON COLUMN leads.reto IS 'Mayor reto del negocio';
COMMENT ON COLUMN leads.ip_address IS 'IP del usuario que se registró';
COMMENT ON COLUMN leads.origen IS 'Página de origen (siempre apply.html)';
COMMENT ON COLUMN leads.created_at IS 'Fecha/hora del registro';
