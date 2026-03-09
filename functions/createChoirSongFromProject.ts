import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { choir_id, project_id, job_id, title, bpm, key, time_signature, notes } = await req.json();
    if (!choir_id || !title?.trim()) {
      return Response.json({ error: 'choir_id and title are required' }, { status: 400 });
    }

    const callerMems = await base44.asServiceRole.entities.ChoirMembership.filter({
      choir_id, user_id: user.id, status: 'approved'
    });
    const callerMem = callerMems[0];
    if (!callerMem || !['admin', 'director'].includes(callerMem.role)) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const songData = { choir_id, title: title.trim() };
    if (project_id) songData.project_id = project_id;
    if (job_id) songData.job_id = job_id;
    if (bpm) songData.bpm = Number(bpm);
    if (key) songData.key = key;
    if (time_signature) songData.time_signature = time_signature;
    if (notes) songData.notes = notes;

    const song = await base44.asServiceRole.entities.ChoirSong.create(songData);
    return Response.json({ song });
  } catch (e) {
    console.error('createChoirSongFromProject error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});