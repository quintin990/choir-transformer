import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // assets: [{url, name, type, part_scope, job_id?}]
    const { choir_song_id, assets } = await req.json();
    if (!choir_song_id || !assets?.length) {
      return Response.json({ error: 'choir_song_id and assets are required' }, { status: 400 });
    }

    const song = await base44.asServiceRole.entities.ChoirSong.get(choir_song_id);
    if (!song) return Response.json({ error: 'Song not found' }, { status: 404 });

    const callerMems = await base44.asServiceRole.entities.ChoirMembership.filter({
      choir_id: song.choir_id, user_id: user.id, status: 'approved'
    });
    const callerMem = callerMems[0];
    if (!callerMem || !['admin', 'director'].includes(callerMem.role)) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const records = assets.map(a => ({
      choir_id: song.choir_id,
      choir_song_id,
      type: a.type || 'stem',
      part_scope: a.part_scope || 'all',
      name: a.name,
      url: a.url,
      created_by_user_id: user.id,
      ...(a.job_id ? { job_id: a.job_id } : {}),
    }));

    const created = await base44.asServiceRole.entities.ChoirAsset.bulkCreate(records);
    return Response.json({ assets: created });
  } catch (e) {
    console.error('publishJobAssetsToChoir error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});