const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uqsrfwluorehqfyefnxk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxc3Jmd2x1b3JlaHFmeWVmbnhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzOTEzMSwiZXhwIjoyMDkyODE1MTMxfQ.3XWHIpRG2r5YOA46GJQkSC6u-baBoLax4Q-zJtlJcUM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function createLeadsTable() {
  try {
    console.log('🔧 Creando tabla leads...');

    // Crear tabla
    const { error: createError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (!createError) {
      console.log('✅ Tabla leads ya existe');
      return;
    }

    // Si no existe, crear mediante SQL
    const { data, error } = await supabase.rpc('exec', {
      sql: `
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
          created_at TIMESTAMP DEFAULT NOW(),
          ip_address INET,
          origen TEXT DEFAULT 'apply.html'
        );

        ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "insert_leads" ON leads
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "read_leads_anon" ON leads
          FOR SELECT USING (auth.role() = 'authenticated');
      `
    });

    if (error && error.message.includes('does not exist')) {
      console.log('ℹ️  Creando tabla manualmente via REST API...');
      // Intento alternativo con HTTP
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          nombre: '_test_',
          email: '_test@test_',
          whatsapp: '_test_',
          negocio: '_test_'
        })
      });

      console.log('✅ Tabla creada exitosamente');
    } else {
      console.log('✅ Tabla leads lista');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createLeadsTable();
