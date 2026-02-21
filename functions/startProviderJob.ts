import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { job_id } = await req.json();

    // Fetch job
    const jobs = await base44.entities.Job.filter({ id: job_id });
    if (jobs.length === 0) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    // Verify ownership
    if (job.created_by !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update job status
    await base44.entities.Job.update(job_id, {
      status: 'running',
      progress: 1,
      stage: 'Processing'
    });

    // Log event
    await base44.entities.JobEvent.create({
      job_id: job_id,
      level: 'info',
      message: 'Job started processing'
    });

    // Call external GPU API
    const gpuApiUrl = Deno.env.get('GPU_API_BASE_URL');
    const gpuApiKey = Deno.env.get('GPU_API_KEY');

    if (!gpuApiUrl || !gpuApiKey) {
      throw new Error('GPU API credentials not configured');
    }

    // Construct callback URL
    const callbackUrl = `${new URL(req.url).origin}/api/functions/providerCallback`;

    const response = await fetch(`${gpuApiUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gpuApiKey}`
      },
      body: JSON.stringify({
        job_id: job_id,
        input_file_url: job.input_file,
        separation_mode: job.separation_mode,
        output_format: job.output_format,
        callback_url: callbackUrl,
        callback_token: job.callback_token
      })
    });

    if (!response.ok) {
      throw new Error(`GPU API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Store provider job ID
    await base44.entities.Job.update(job_id, {
      provider_job_id: result.provider_job_id,
      provider_name: 'gpu_service'
    });

    await base44.entities.JobEvent.create({
      job_id: job_id,
      level: 'info',
      message: `Started processing with provider job ID: ${result.provider_job_id}`
    });

    return Response.json({ status: 'success', provider_job_id: result.provider_job_id });
  } catch (error) {
    console.error('Error starting provider job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});