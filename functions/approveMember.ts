import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { membership_id, status, role } = await req.json();
    if (!membership_id || !status) return Response.json({ error: 'membership_id and status required' }, { status: 400 });

    const target = await base44.asServiceRole.entities.ChoirMembership.get(membership_id);
    if (!target) return Response.json({ error: 'Membership not found' }, { status: 404 });

    const callerMems = await base44.asServiceRole.entities.ChoirMembership.filter({
      choir_id: target.choir_id, user_id: user.id, status: 'approved'
    });
    const callerMem = callerMems[0];
    if (!callerMem || !['admin', 'director'].includes(callerMem.role)) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updates = { status };
    if (role) updates.role = role;
    const updated = await base44.asServiceRole.entities.ChoirMembership.update(membership_id, updates);

    return Response.json({ membership: updated });
  } catch (e) {
    console.error('approveMember error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});