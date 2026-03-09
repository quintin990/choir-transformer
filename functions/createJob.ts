import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      kind,
      title,
      input_file_url,
      input_file_name,
      mode,
      quality,
      target_platform,
      target_lufs,
    } = payload;

    const job = await base44.asServiceRole.entities.Job.create({
      user_id: user.id,
      kind,
      title: title || input_file_name,
      input_file_url,
      input_file_name,
      input_mime: 'audio/mpeg',
      mode: mode || 'two_stems',
      separation_mode: mode || 'two_stems',
      quality: quality || 'balanced',
      separation_model: quality || 'balanced',
      status: 'queued',
      target_platform,
      target_lufs,
    });

    return Response.json(job);
  } catch (error) {
    console.error('Job creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});