import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { invite_code } = await req.json();
    if (!invite_code?.trim()) return Response.json({ error: 'Invite code required' }, { status: 400 });

    const choirs = await base44.asServiceRole.entities.Choir.filter({ invite_code: invite_code.trim().toUpperCase() });
    if (!choirs.length) return Response.json({ error: 'Invalid invite code. Check with your director.' }, { status: 404 });
    const choir = choirs[0];

    const existing = await base44.asServiceRole.entities.ChoirMembership.filter({ choir_id: choir.id, user_id: user.id });
    if (existing.length) {
      const mem = existing[0];
      if (mem.status === 'approved') return Response.json({ error: 'You are already a member of this choir.' }, { status: 409 });
      if (mem.status === 'pending') return Response.json({ error: 'Your request is already pending approval.' }, { status: 409 });
      // rejected/removed — allow re-request
      const updated = await base44.asServiceRole.entities.ChoirMembership.update(mem.id, { status: 'pending', role: 'member' });
      return Response.json({ membership: updated, choir });
    }

    const membership = await base44.asServiceRole.entities.ChoirMembership.create({
      choir_id: choir.id,
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name || user.email,
      status: 'pending',
      role: 'member',
      part: 'none',
      joined_at: new Date().toISOString(),
    });

    return Response.json({ membership, choir });
  } catch (e) {
    console.error('joinChoirByInviteCode error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});