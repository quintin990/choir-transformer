import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { kind, title, input_file_url, input_file_name, input_file_size_bytes, input_mime,
            mode, quality, output_format, rights_confirmed, target_platform, target_lufs } = body;

    const callback_token = crypto.randomUUID().replace(/-/g, '');

    const job = await base44.entities.Job.create({
      user_id: user.id,
      kind: kind || 'stems',
      title: title || input_file_name || 'Untitled',
      input_file_url,
      input_file: input_file_url,
      input_file_name,
      input_filename: input_file_name,
      input_file_size_bytes,
      input_size_bytes: input_file_size_bytes,
      input_mime,
      mode,
      separation_mode: mode,
      quality,
      separation_model: quality === 'hq' ? 'high_quality' : quality,
      output_format: output_format || 'wav',
      status: 'queued',
      progress: 0,
      stage: 'Queued',
      rights_confirmed: rights_confirmed || false,
      rights_confirmed_at: rights_confirmed ? new Date().toISOString() : null,
      callback_token,
      target_platform,
      target_lufs,
      tags: [],
      retention_delete_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return Response.json({ job_id: job.id, job });
  } catch (err) {
    console.error('createJob error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});