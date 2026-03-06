import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, input_file_url, input_file_meta, separation_mode, output_format } = await req.json();

    // Validate file type
    const validMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
    if (!validMimes.includes(input_file_meta.mime) && !input_file_meta.filename.match(/\.(mp3|wav)$/i)) {
      return Response.json({ error: 'Only MP3 and WAV files are supported' }, { status: 400 });
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (input_file_meta.size > maxSize) {
      return Response.json({ error: 'File size must be under 50MB' }, { status: 400 });
    }

    // Generate callback token
    const callbackToken = crypto.randomUUID();

    // Calculate retention date (7 days from now)
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + 7);

    // Create job record
    const job = await base44.entities.Job.create({
      title: title || input_file_meta.filename,
      input_file: input_file_url,
      input_filename: input_file_meta.filename,
      input_mime: input_file_meta.mime,
      input_size_bytes: input_file_meta.size,
      separation_mode,
      output_format,
      status: 'queued',
      progress: 0,
      stage: 'Queued',
      callback_token: callbackToken,
      retention_delete_at: retentionDate.toISOString()
    });

    // Log event
    await base44.entities.JobEvent.create({
      job_id: job.id,
      level: 'info',
      message: 'Job created and queued'
    });

    // Start the provider job
    try {
      await base44.functions.invoke('startProviderJob', { job_id: job.id });
    } catch (error) {
      console.error('Failed to start provider job:', error);
      await base44.entities.Job.update(job.id, {
        status: 'failed',
        error_message: 'Failed to start processing'
      });
    }

    return Response.json({ job_id: job.id, status: 'success' });
  } catch (error) {
    console.error('Error creating job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});