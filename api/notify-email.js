const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nombre, email, whatsapp, negocio, web, reto, inversion, fundador } = req.body;

    if (!nombre || !email || !whatsapp || !negocio) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured');
      return res.status(200).json({ success: true, skipped: true });
    }

    const whatsappNumber = whatsapp.replace(/\D/g, '');
    const whatsappMessage = encodeURIComponent(`¡Hola ${nombre}! Vi tu solicitud de ${negocio}. ¿Cuándo podemos hablar?`);

    const emailContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #c9a974; margin-bottom: 20px;">🔔 Nuevo Lead en VITA Studio</h2>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 8px 0;"><strong>👤 Nombre:</strong> ${nombre}</p>
          <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${email}</p>
          <p style="margin: 8px 0;"><strong>💬 WhatsApp:</strong> ${whatsapp}</p>
          <p style="margin: 8px 0;"><strong>🏢 Negocio:</strong> ${negocio}</p>
          <p style="margin: 8px 0;"><strong>🌐 Sitio web:</strong> ${web || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>🎯 Mayor reto:</strong> ${reto || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>💰 Inversión:</strong> ${inversion || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>👨 ¿Es fundador?:</strong> ${fundador || 'N/A'}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://wa.me/${whatsappNumber}?text=${whatsappMessage}" style="display: inline-block; background: #25d366; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-right: 10px;">💬 Contactar por WhatsApp</a>
          <a href="https://www.vitastudio.site/admin" style="display: inline-block; background: #c9a974; color: #000; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600;">📊 Ver en Dashboard</a>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 0.9rem; text-align: center;">
          VITA Studio • Dashboard: <a href="https://www.vitastudio.site/admin" style="color: #c9a974;">vitastudio.site/admin</a>
        </p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'VITA Studio <onboarding@resend.dev>',
        to: FOUNDER_EMAIL,
        subject: `🔔 Nuevo Lead: ${nombre}`,
        html: emailContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return res.status(200).json({ success: true, emailError: true });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      emailSent: true,
      messageId: data.id
    });
  } catch (error) {
    console.error('Notify email error:', error);
    return res.status(200).json({ success: true, error: error.message });
  }
}
