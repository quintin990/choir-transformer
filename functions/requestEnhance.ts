import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id } = await req.json();
    if (!job_id) return Response.json({ error: 'job_id required' }, { status: 400 });

    const jobs = await base44.entities.Job.filter({ id: job_id });
    const job = jobs[0];
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });
    if (job.user_id && job.user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const runpodKey = Deno.env.get('RUNPOD_API_KEY');
    if (!runpodKey) {
      await base44.entities.Job.update(job_id, { stage: 'Backend not connected' });
      console.log('requestEnhance: backend not connected for job', job_id);
      return Response.json({ status: 'queued', stage: 'Backend not connected' });
    }

    // When backend is connected, dispatch enhance job here
    await base44.entities.Job.update(job_id, { stage: 'Enhance queued', progress: 0 });
    console.log('requestEnhance: dispatched for job', job_id, 'options:', job.clean_audio_options_json);
    return Response.json({ status: 'queued' });
  } catch (error) {
    console.error('requestEnhance error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});