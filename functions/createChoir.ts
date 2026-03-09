import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, church_name, location, description } = await req.json();
    if (!name?.trim()) return Response.json({ error: 'Choir name is required' }, { status: 400 });

    // Check for duplicate choir name owned by this user
    const existing = await base44.asServiceRole.entities.Choir.filter({
      owner_user_id: user.id,
      name: name.trim()
    });
    
    if (existing.length > 0) {
      return Response.json({ error: 'You already have a choir with this name' }, { status: 400 });
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const invite_code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    const choir = await base44.asServiceRole.entities.Choir.create({
      name: name.trim(),
      church_name: church_name?.trim() || '',
      location: location?.trim() || '',
      description: description?.trim() || '',
      owner_user_id: user.id,
      invite_code,
    });

    await base44.asServiceRole.entities.ChoirMembership.create({
      choir_id: choir.id,
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name || user.email,
      status: 'approved',
      role: 'admin',
      part: 'none',
      joined_at: new Date().toISOString(),
    });

    return Response.json({ choir });
  } catch (e) {
    console.error('createChoir error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});