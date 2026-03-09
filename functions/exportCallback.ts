import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { job_id, callback_token, asset_url, asset_name, error } = body;

    if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

    // Verify callback token
    const jobs = await base44.asServiceRole.entities.Job.filter({ id: job_id });
    const job = jobs[0];
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });
    if (job.callback_token && job.callback_token !== callback_token) {
      return Response.json({ error: 'Invalid callback token' }, { status: 403 });
    }

    if (error) {
      await base44.asServiceRole.entities.Job.update(job_id, {
        export_status: 'failed',
        export_error_message: error,
      });
      return Response.json({ ok: true, status: 'failed' });
    }

    // Save asset record
    if (asset_url) {
      await base44.asServiceRole.entities.JobAsset.create({
        job_id,
        type: 'daw_session',
        name: asset_name || 'session.rpp',
        url: asset_url,
      });

      await base44.asServiceRole.entities.Job.update(job_id, {
        export_status: 'ready',
        export_asset_url: asset_url,
        export_error_message: null,
      });
    }

    return Response.json({ ok: true, status: 'ready' });
  } catch (err) {
    console.error('exportCallback error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});