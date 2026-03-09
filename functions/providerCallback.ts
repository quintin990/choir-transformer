import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    const {
      job_id,
      callback_token,
      status,
      progress,
      stage,
      stems_urls,
      output_zip_url,
      error_message,
      duration_seconds,
      sample_rate,
      channels,
      clean_assets,
      harmony_assets,
      satb_confidence_json,
    } = payload;

    // Fetch job using service role (no user auth required for callbacks)
    const jobs = await base44.asServiceRole.entities.Job.filter({ id: job_id });
    if (jobs.length === 0) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    // Validate callback token
    if (job.callback_token !== callback_token) {
      return Response.json({ error: 'Invalid callback token' }, { status: 403 });
    }

    // Update job
    const updates = {
      status,
      progress: progress || 100,
      stage: stage || 'Complete'
    };

    if (error_message) {
      updates.error_message = error_message;
    }

    if (stems_urls) {
      updates.stems = stems_urls;
    }

    if (output_zip_url) {
      updates.output_zip_file = output_zip_url;
    }

    if (duration_seconds) {
      updates.duration_seconds = duration_seconds;
    }

    if (sample_rate) {
      updates.sample_rate = sample_rate;
    }

    if (channels) {
      updates.channels = channels;
    }

    if (satb_confidence_json) {
      updates.satb_confidence_json = satb_confidence_json;
    }

    await base44.asServiceRole.entities.Job.update(job_id, updates);

    // Save clean audio / harmony assets into JobAsset
    const assetTypes = [
      ...(clean_assets ? Object.entries(clean_assets) : []),
      ...(harmony_assets ? Object.entries(harmony_assets) : []),
    ];
    for (const [type, url] of assetTypes) {
      if (url) {
        await base44.asServiceRole.entities.JobAsset.create({ job_id, type, url, name: type });
      }
    }

    // Log event
    const eventLevel = status === 'failed' ? 'error' : 'info';
    const eventMessage = status === 'done' 
      ? 'Job completed successfully' 
      : status === 'failed' 
      ? `Job failed: ${error_message || 'Unknown error'}` 
      : `Job status: ${status}`;

    await base44.asServiceRole.entities.JobEvent.create({
      job_id: job_id,
      level: eventLevel,
      message: eventMessage,
      payload_json: payload
    });

    return Response.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing callback:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});