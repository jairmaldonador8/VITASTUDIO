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
    const whatsappMessage = encodeURIComponent(`Hola ${nombre}. Vi tu solicitud de ${negocio}. ¿Cuándo podemos hablar?`);

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      <table style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="padding: 40px 20px;">
            <h1 style="color: #000; font-size: 24px; font-weight: 600; margin: 0 0 30px 0;">Nuevo Lead</h1>

            <table style="width: 100%; margin-bottom: 30px;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Nombre</p>
                  <p style="color: #000; font-size: 16px; font-weight: 500; margin: 0;">${nombre}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Email</p>
                  <p style="color: #000; font-size: 16px; font-weight: 500; margin: 0;"><a href="mailto:${email}" style="color: #c9a974; text-decoration: none;">${email}</a></p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">WhatsApp</p>
                  <p style="color: #000; font-size: 16px; font-weight: 500; margin: 0;"><a href="https://wa.me/${whatsappNumber}" style="color: #c9a974; text-decoration: none;">${whatsapp}</a></p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Negocio</p>
                  <p style="color: #000; font-size: 16px; font-weight: 500; margin: 0;">${negocio}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Mayor reto</p>
                  <p style="color: #000; font-size: 16px; font-weight: 500; margin: 0;">${reto || '—'}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0;">Inversión mensual</p>
                  <p style="color: #000; font-size: 16px; font-weight: 500; margin: 0;">${inversion || '—'}</p>
                </td>
              </tr>
            </table>

            <table style="width: 100%; margin-bottom: 30px;">
              <tr>
                <td style="padding-right: 10px;">
                  <a href="https://wa.me/${whatsappNumber}?text=${whatsappMessage}" style="display: block; background: #25d366; color: white; padding: 14px 20px; border-radius: 4px; text-decoration: none; font-weight: 600; text-align: center; font-size: 14px;">Contactar por WhatsApp</a>
                </td>
                <td style="padding-left: 10px;">
                  <a href="https://www.vitastudio.site/admin" style="display: block; background: #c9a974; color: #000; padding: 14px 20px; border-radius: 4px; text-decoration: none; font-weight: 600; text-align: center; font-size: 14px;">Ver en Dashboard</a>
                </td>
              </tr>
            </table>

            <p style="color: #999; font-size: 12px; text-align: center; margin: 40px 0 0 0; padding-top: 20px; border-top: 1px solid #eee;">
              VITA Studio Admin • <a href="https://www.vitastudio.site/admin" style="color: #c9a974; text-decoration: none;">vitastudio.site/admin</a>
            </p>
          </td>
        </tr>
      </table>
      </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: Buffer.from(JSON.stringify({
        from: 'VITA Studio <onboarding@resend.dev>',
        to: FOUNDER_EMAIL,
        subject: `🔔 Nuevo Lead: ${nombre}`,
        html: emailContent
      }), 'utf8')
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
