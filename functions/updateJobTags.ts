import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id, tags } = await req.json();
    const jobs = await base44.entities.Job.filter({ id: job_id });
    const job = jobs[0];
    if (!job) return Response.json({ error: 'Not found' }, { status: 404 });
    if (job.user_id && job.user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await base44.entities.Job.update(job_id, { tags });
    return Response.json({ job: updated });
  } catch (err) {
    console.error('updateJobTags error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});