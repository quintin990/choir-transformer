import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Polls RunPod for job status and updates the Job entity.
// Called from the frontend every ~3s while a job is active.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { job_id } = await req.json();

    const jobs = await base44.entities.Job.filter({ id: job_id });
    if (jobs.length === 0) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    if (job.created_by !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If terminal state, just return current job
    if (['done', 'failed', 'cancelled'].includes(job.status)) {
      return Response.json({ job });
    }

    // If no RunPod job ID yet, return current state
    if (!job.provider_job_id) {
      return Response.json({ job });
    }

    const RUNPOD_API_KEY = Deno.env.get('RUNPOD_API_KEY');
    const RUNPOD_ENDPOINT_ID = Deno.env.get('RUNPOD_ENDPOINT_ID');

    if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
      return Response.json({ job });
    }

    // Poll RunPod status endpoint
    const statusResponse = await fetch(
      `https://api.runpod.io/v2/${RUNPOD_ENDPOINT_ID}/status/${job.provider_job_id}`,
      {
        headers: { 'Authorization': `Bearer ${RUNPOD_API_KEY}` }
      }
    );

    if (!statusResponse.ok) {
      console.error('RunPod status poll failed:', statusResponse.status);
      return Response.json({ job });
    }

    const runpodStatus = await statusResponse.json();
    console.log('RunPod status:', JSON.stringify(runpodStatus));

    // Map RunPod status to our status
    // RunPod statuses: IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED, CANCELLED, TIMED_OUT
    let updates = null;

    if (runpodStatus.status === 'IN_QUEUE') {
      updates = { status: 'queued', stage: 'Queued on GPU', progress: 5 };
    } else if (runpodStatus.status === 'IN_PROGRESS') {
      // RunPod may return progress in output during streaming
      const progress = runpodStatus.output?.progress || job.progress || 10;
      const stage = runpodStatus.output?.stage || 'Separating stems';
      updates = { status: 'running', stage, progress: Math.max(progress, 10) };
    } else if (runpodStatus.status === 'COMPLETED') {
      // Job completed — parse output and update
      const output = runpodStatus.output || {};
      updates = {
        status: 'done',
        progress: 100,
        stage: 'Complete',
        stems: output.stems || {},
        output_zip_file: output.zip_url || null,
        duration_seconds: output.duration_seconds || null,
        sample_rate: output.sample_rate || null,
        channels: output.channels || null
      };
      await base44.entities.JobEvent.create({
        job_id,
        level: 'info',
        message: 'Job completed successfully via poll'
      });
    } else if (['FAILED', 'TIMED_OUT', 'CANCELLED'].includes(runpodStatus.status)) {
      const errorMsg = runpodStatus.output?.error || `RunPod status: ${runpodStatus.status}`;
      updates = {
        status: 'failed',
        stage: 'Failed',
        error_message: errorMsg
      };
      await base44.entities.JobEvent.create({
        job_id,
        level: 'error',
        message: `Job failed: ${errorMsg}`
      });
    }

    if (updates) {
      await base44.entities.Job.update(job_id, updates);
      const updatedJobs = await base44.entities.Job.filter({ id: job_id });
      return Response.json({ job: updatedJobs[0] });
    }

    return Response.json({ job });

  } catch (error) {
    console.error('providerPollStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});