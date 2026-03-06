import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// RunPod Serverless API
// Docs: https://docs.runpod.io/serverless/endpoints/invoke-job
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { job_id } = await req.json();

    const RUNPOD_API_KEY = Deno.env.get('RUNPOD_API_KEY');
    const RUNPOD_ENDPOINT_ID = Deno.env.get('RUNPOD_ENDPOINT_ID');

    if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
      console.error('Missing RunPod credentials');
      return Response.json({ error: 'GPU service not configured' }, { status: 500 });
    }

    // Fetch job using service role (called internally from createJobAndStart)
    const jobs = await base44.asServiceRole.entities.Job.filter({ id: job_id });
    if (jobs.length === 0) {
      console.error('Job not found:', job_id);
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    // Mark as running
    await base44.asServiceRole.entities.Job.update(job_id, {
      status: 'running',
      progress: 2,
      stage: 'Dispatching to GPU'
    });

    // Build the callback URL for RunPod to call when done
    // RunPod will POST results back to providerCallback
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || new URL(req.url).origin;
    const callbackUrl = `${appBaseUrl}/api/functions/providerCallback`;

    // Map internal model names to Demucs model names
    const modelMap = {
      fast: 'htdemucs',
      balanced: 'htdemucs_ft',
      high_quality: 'htdemucs_6s',
      artifact_free: 'mdx_extra'
    };

    const demucsModel = modelMap[job.separation_model] || 'htdemucs_ft';
    const stems = job.separation_mode === 'four_stems'
      ? ['vocals', 'drums', 'bass', 'other']
      : ['vocals', 'no_vocals'];

    // Submit job to RunPod Serverless /run endpoint
    const runpodResponse = await fetch(
      `https://api.runpod.io/v2/${RUNPOD_ENDPOINT_ID}/run`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNPOD_API_KEY}`
        },
        body: JSON.stringify({
          input: {
            audio_url: job.input_file,
            model: demucsModel,
            stems: stems,
            output_format: job.output_format || 'wav',
            output_settings: job.output_settings || {},
            job_id: job_id,
            callback_url: callbackUrl,
            callback_token: job.callback_token
          }
        })
      }
    );

    if (!runpodResponse.ok) {
      const errorText = await runpodResponse.text();
      console.error('RunPod API error:', runpodResponse.status, errorText);
      await base44.asServiceRole.entities.Job.update(job_id, {
        status: 'failed',
        error_message: `GPU dispatch failed: ${runpodResponse.status}`
      });
      await base44.asServiceRole.entities.JobEvent.create({
        job_id,
        level: 'error',
        message: `RunPod dispatch failed: ${runpodResponse.status} - ${errorText}`
      });
      return Response.json({ error: 'Failed to dispatch GPU job' }, { status: 500 });
    }

    const runpodData = await runpodResponse.json();
    const providerJobId = runpodData.id;

    console.log('RunPod job dispatched:', providerJobId);

    // Store RunPod job ID
    await base44.asServiceRole.entities.Job.update(job_id, {
      provider_job_id: providerJobId,
      provider_name: 'runpod',
      stage: 'Queued on GPU'
    });

    await base44.asServiceRole.entities.JobEvent.create({
      job_id,
      level: 'info',
      message: `Dispatched to RunPod. Provider job ID: ${providerJobId}`
    });

    return Response.json({ status: 'success', provider_job_id: providerJobId });

  } catch (error) {
    console.error('startProviderJob error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});