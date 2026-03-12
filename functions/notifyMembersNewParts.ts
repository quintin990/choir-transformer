import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { choir_song_id, choir_id, song_title, asset_names = [] } = await req.json();

    if (!choir_id || !song_title) {
      return Response.json({ error: 'choir_id and song_title are required' }, { status: 400 });
    }

    // Verify the sender is a director or admin of this choir
    const memberships = await base44.asServiceRole.entities.ChoirMembership.filter({
      choir_id,
      user_id: user.id,
    });
    const senderMem = memberships[0];
    if (!senderMem || (senderMem.role !== 'director' && senderMem.role !== 'admin' && user.role !== 'admin')) {
      return Response.json({ error: 'Only directors can send notifications' }, { status: 403 });
    }

    // Get choir name
    const choirs = await base44.asServiceRole.entities.Choir.filter({ id: choir_id });
    const choirName = choirs[0]?.name || 'Your Choir';

    // Get all approved members
    const allMemberships = await base44.asServiceRole.entities.ChoirMembership.filter({
      choir_id,
      status: 'approved',
    });

    if (!allMemberships.length) {
      return Response.json({ sent: 0, message: 'No members to notify' });
    }

    // Get user emails
    const memberUserIds = allMemberships.map(m => m.user_id);
    const users = await base44.asServiceRole.entities.User.list();
    const memberUsers = users.filter(u => memberUserIds.includes(u.id));

    const assetList = asset_names.length > 0
      ? asset_names.map(n => `• ${n}`).join('\n')
      : '• New practice materials';

    let sent = 0;
    const errors = [];

    for (const member of memberUsers) {
      if (!member.email) continue;
      const memberMem = allMemberships.find(m => m.user_id === member.id);
      const partLabel = memberMem?.part && memberMem.part !== 'none'
        ? ` (${memberMem.part.charAt(0).toUpperCase() + memberMem.part.slice(1)})`
        : '';

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: member.email,
          from_name: choirName,
          subject: `🎵 New parts ready: ${song_title}`,
          body: `Hi ${member.full_name || 'there'}${partLabel},

New practice materials have been published for "${song_title}" in ${choirName}.

Files available:
${assetList}

Log in to your Auralyn dashboard to access your parts, listen, and mark your readiness.

See you at rehearsal!
${user.full_name || 'Your Director'}
${choirName}`,
        });
        sent++;
      } catch (e) {
        console.error(`Failed to email ${member.email}:`, e.message);
        errors.push(member.email);
      }
    }

    console.log(`Sent ${sent} notifications for "${song_title}" in choir ${choir_id}`);

    return Response.json({
      sent,
      total: memberUsers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('notifyMembersNewParts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});