import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { membership_id, part } = await req.json();
    if (!membership_id || !part) return Response.json({ error: 'membership_id and part required' }, { status: 400 });

    const membership = await base44.asServiceRole.entities.ChoirMembership.get(membership_id);
    if (!membership) return Response.json({ error: 'Membership not found' }, { status: 404 });
    if (membership.user_id !== user.id) return Response.json({ error: 'Not your membership' }, { status: 403 });

    const updated = await base44.asServiceRole.entities.ChoirMembership.update(membership_id, { part });
    return Response.json({ membership: updated });
  } catch (e) {
    console.error('setMemberPart error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});