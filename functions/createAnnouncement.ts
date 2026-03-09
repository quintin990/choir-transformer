import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { choir_id, title, message } = await req.json();
    if (!choir_id || !title?.trim() || !message?.trim()) {
      return Response.json({ error: 'choir_id, title, and message are required' }, { status: 400 });
    }

    const callerMems = await base44.asServiceRole.entities.ChoirMembership.filter({
      choir_id, user_id: user.id, status: 'approved'
    });
    const callerMem = callerMems[0];
    if (!callerMem || !['admin', 'director'].includes(callerMem.role)) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const announcement = await base44.asServiceRole.entities.ChoirAnnouncement.create({
      choir_id,
      title: title.trim(),
      message: message.trim(),
      created_by_user_id: user.id,
      created_by_name: user.full_name || user.email,
    });

    return Response.json({ announcement });
  } catch (e) {
    console.error('createAnnouncement error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});