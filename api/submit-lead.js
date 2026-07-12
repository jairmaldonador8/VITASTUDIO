import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Obtener IP del cliente
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

// Validar email básico
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nombre, email, whatsapp, negocio, web, inversion, fundador, reto } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !whatsapp || !negocio) {
      return res.status(400).json({ error: 'Campos requeridos faltando' });
    }

    // Validar email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar WhatsApp (teléfono)
    if (!/^\+?[0-9]{7,15}$/.test(whatsapp.replace(/\s|-/g, ''))) {
      return res.status(400).json({ error: 'WhatsApp inválido' });
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nombre: nombre.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          negocio: negocio.trim(),
          web: web?.trim() || null,
          inversion: inversion?.trim() || null,
          fundador: fundador?.trim() || null,
          reto: reto?.trim() || null,
          ip_address: getClientIP(req),
          origen: 'apply.html'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Error al guardar lead' });
    }

    // Enviar notificación email al founder
    if (data[0]) {
      try {
        await fetch(req.headers.host?.includes('localhost')
          ? 'http://localhost:3000/api/notify-email'
          : 'https://www.vitastudio.site/api/notify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre, email, whatsapp, negocio, web, inversion, fundador, reto
          })
        }).catch(err => console.warn('Email notification failed:', err.message));
      } catch (err) {
        console.warn('Email notification error:', err.message);
      }
    }

    // Éxito
    return res.status(201).json({
      success: true,
      message: 'Lead guardado correctamente',
      id: data[0]?.id
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
