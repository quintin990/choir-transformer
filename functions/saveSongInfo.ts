import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id, bpm_confirmed, key_confirmed, time_signature_confirmed } = await req.json();
    if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

    const update = {};
    if (bpm_confirmed != null) update.bpm_confirmed = bpm_confirmed;
    if (key_confirmed != null) update.key_confirmed = key_confirmed;
    if (time_signature_confirmed != null) update.time_signature_confirmed = time_signature_confirmed;

    const job = await base44.asServiceRole.entities.Job.update(job_id, update);
    console.log('saveSongInfo saved for job', job_id, update);
    return Response.json({ success: true, job });
  } catch (error) {
    console.error('saveSongInfo error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});