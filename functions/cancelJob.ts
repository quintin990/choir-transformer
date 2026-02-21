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
      status: 'cancelled',
      stage: 'Cancelled'
    });

    // Log event
    await base44.entities.JobEvent.create({
      job_id: job_id,
      level: 'info',
      message: 'Job cancelled by user'
    });

    // Best effort: notify GPU API to cancel
    const gpuApiUrl = Deno.env.get('GPU_API_BASE_URL');
    const gpuApiKey = Deno.env.get('GPU_API_KEY');

    if (gpuApiUrl && gpuApiKey && job.provider_job_id) {
      try {
        await fetch(`${gpuApiUrl}/jobs/${job.provider_job_id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gpuApiKey}`
          }
        });
      } catch (error) {
        console.error('Failed to notify provider of cancellation:', error);
      }
    }

    return Response.json({ status: 'success' });
  } catch (error) {
    console.error('Error cancelling job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});