import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { job_id } = body;

    const jobs = await base44.entities.Job.filter({ id: job_id });
    const job = jobs[0];
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });
    if (job.user_id && job.user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const runpodKey = Deno.env.get('RUNPOD_API_KEY');
    const runpodEndpoint = Deno.env.get('RUNPOD_ENDPOINT_ID');

    if (!runpodKey || !runpodEndpoint) {
      await base44.entities.Job.update(job_id, {
        status: 'queued',
        stage: 'Backend not connected',
        progress: 0,
      });
      return Response.json({ status: 'queued', stage: 'Backend not connected' });
    }

    await base44.entities.Job.update(job_id, {
      status: 'processing',
      stage: 'Sent to GPU',
      progress: 5,
    });

    const callbackUrl = `${Deno.env.get('BASE44_FUNCTION_BASE_URL') || ''}/providerCallback`;

    const runpodRes = await fetch(
      `https://api.runpod.ai/v2/${runpodEndpoint}/run`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${runpodKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            job_id,
            kind: job.kind,
            input_file_url: job.input_file_url || job.input_file,
            mode: job.mode || job.separation_mode,
            quality: job.quality,
            output_format: job.output_format || 'wav',
            callback_token: job.callback_token,
            callback_url: callbackUrl,
            clean_audio_enabled: job.clean_audio_enabled || false,
            clean_audio_options_json: job.clean_audio_options_json || null,
            harmony_mode: job.harmony_mode || 'none',
            harmony_options_json: job.harmony_options_json || null,
          }
        })
      }
    );

    const runpodData = await runpodRes.json();
    console.log('RunPod response:', JSON.stringify(runpodData));

    if (runpodData.id) {
      await base44.entities.Job.update(job_id, { provider_job_id: runpodData.id });
    }

    return Response.json({ status: 'processing', provider_job_id: runpodData.id });
  } catch (err) {
    console.error('startJob error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});