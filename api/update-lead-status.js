import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const VALID_STATUSES = ['nuevo', 'contactado', 'en_proceso', 'cerrado'];

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, status, notes } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing id or status' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update lead' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead updated'
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
