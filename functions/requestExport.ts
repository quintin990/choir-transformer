import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id, daw_format, options } = await req.json();
    if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

    const jobs = await base44.entities.Job.filter({ id: job_id });
    const job = jobs[0];
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });
    if (job.user_id && job.user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (job.status !== 'done') return Response.json({ error: 'Job must be done before exporting' }, { status: 400 });

    const exportKey = Deno.env.get('EXPORT_SERVICE_KEY');

    if (!exportKey) {
      await base44.entities.Job.update(job_id, {
        export_status: 'failed',
        export_error_message: 'Export backend not connected yet. Reaper .rpp generation will be available soon.',
      });
      return Response.json({ export_status: 'failed', message: 'Export backend not connected yet.' });
    }

    // Set to preparing
    await base44.entities.Job.update(job_id, { export_status: 'preparing', export_error_message: null });

    // Call external export service
    const exportRes = await fetch('https://export.auralyn.io/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${exportKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id,
        daw_format: daw_format || 'reaper',
        stems: job.stems || {},
        clip_start_sec: job.clip_start_sec,
        clip_end_sec: job.clip_end_sec,
        preset: job.export_preset_json || {},
        options: options || {},
        title: job.title || 'AuralynSession',
        callback_token: job.callback_token,
      }),
    });

    const exportData = await exportRes.json();
    console.log('Export service response:', JSON.stringify(exportData));

    return Response.json({ export_status: 'preparing', ...exportData });
  } catch (err) {
    console.error('requestExport error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});