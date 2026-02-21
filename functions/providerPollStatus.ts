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

    // If job is already done or failed, return current status
    if (job.status === 'done' || job.status === 'failed' || job.status === 'cancelled') {
      return Response.json({ job });
    }

    // Poll GPU API for status
    const gpuApiUrl = Deno.env.get('GPU_API_BASE_URL');
    const gpuApiKey = Deno.env.get('GPU_API_KEY');

    if (!gpuApiUrl || !gpuApiKey || !job.provider_job_id) {
      return Response.json({ job });
    }

    try {
      const response = await fetch(`${gpuApiUrl}/jobs/${job.provider_job_id}`, {
        headers: {
          'Authorization': `Bearer ${gpuApiKey}`
        }
      });

      if (response.ok) {
        const providerStatus = await response.json();

        // Update job if status changed
        if (providerStatus.status !== job.status || providerStatus.progress !== job.progress) {
          const updates = {
            progress: providerStatus.progress || job.progress,
            stage: providerStatus.stage || job.stage
          };

          if (providerStatus.status !== job.status) {
            updates.status = providerStatus.status;
            
            await base44.entities.JobEvent.create({
              job_id: job_id,
              level: 'info',
              message: `Status changed to ${providerStatus.status}`
            });
          }

          await base44.entities.Job.update(job_id, updates);

          // Fetch updated job
          const updatedJobs = await base44.entities.Job.filter({ id: job_id });
          return Response.json({ job: updatedJobs[0] });
        }
      }
    } catch (error) {
      console.error('Error polling provider:', error);
    }

    return Response.json({ job });
  } catch (error) {
    console.error('Error polling status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});