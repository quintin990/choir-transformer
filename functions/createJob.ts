import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { kind, title, input_file_url, input_file_name, input_file_size_bytes, input_mime,
            mode, quality, output_format, rights_confirmed, target_platform, target_lufs,
            clip_start_sec, clip_end_sec, project_id } = body;

    // Plan gating
    const FREE_DAILY_LIMIT = 2;
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    const profile = profiles[0];
    const plan = profile?.plan || 'free';

    if (plan === 'free') {
      const now = new Date();
      const resetAt = profile?.daily_jobs_reset_at ? new Date(profile.daily_jobs_reset_at) : null;
      let used = profile?.daily_jobs_used || 0;
      // Reset counter if new day
      if (!resetAt || now > resetAt) {
        used = 0;
        if (profile) await base44.entities.Profile.update(profile.id, { daily_jobs_used: 0, daily_jobs_reset_at: new Date(now.setHours(23, 59, 59, 999)).toISOString() });
      }
      if (used >= FREE_DAILY_LIMIT) {
        return Response.json({ error: 'Daily job limit reached. Upgrade to Pro for unlimited jobs.', upgrade_required: true }, { status: 403 });
      }
      // Increment
      if (profile) await base44.entities.Profile.update(profile.id, { daily_jobs_used: used + 1 });
    }

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
      clip_start_sec: clip_start_sec ?? null,
      clip_end_sec: clip_end_sec ?? null,
      project_id: project_id || null,
      tags: [],
      retention_delete_at: new Date(Date.now() + (plan === 'pro' ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString(),
    });

    return Response.json({ job_id: job.id, job });
  } catch (err) {
    console.error('createJob error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});