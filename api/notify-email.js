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

    const emailContent = `
      <h2>📨 Nuevo Lead en VITA Studio</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp}</p>
      <p><strong>Negocio:</strong> ${negocio}</p>
      <p><strong>Sitio web:</strong> ${web || 'N/A'}</p>
      <p><strong>Mayor reto:</strong> ${reto || 'N/A'}</p>
      <p><strong>Inversión:</strong> ${inversion || 'N/A'}</p>
      <p><strong>¿Es fundador?:</strong> ${fundador || 'N/A'}</p>
      <hr />
      <p><a href="https://www.vitastudio.site/admin">👉 Ver en Dashboard</a></p>
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
