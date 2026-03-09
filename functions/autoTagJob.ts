import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id } = await req.json();
    const jobs = await base44.entities.Job.filter({ id: job_id });
    if (!jobs.length) return Response.json({ error: 'Job not found' }, { status: 404 });
    const job = jobs[0];

    const prompt = `You are a music production assistant. Based on the following audio job metadata, suggest 4-7 concise tags to help organize this file. Return ONLY a JSON object with a "tags" array of short strings. Tags should describe genre, mood, style, instruments, tempo character, or vocal type relevant to the audio. Keep each tag 1-3 words max.

Title: ${job.title || job.input_file_name || 'Unknown'}
Filename: ${job.input_file_name || ''}
Job type: ${job.kind || 'stems'}
Separation mode: ${job.mode || ''}
BPM: ${job.bpm_confirmed || job.bpm_detected || 'unknown'}
Key: ${job.key_confirmed || job.key_detected || 'unknown'}
Time Signature: ${job.time_signature_confirmed || job.time_signature_detected || 'unknown'}
Existing tags: ${(job.tags || []).join(', ') || 'none'}

Example output: {"tags": ["worship", "contemporary", "4/4", "upbeat", "vocal-led"]}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    const suggested = (result.tags || []).map(t => t.toLowerCase().trim()).filter(Boolean);
    const merged = [...new Set([...(job.tags || []), ...suggested])];
    await base44.entities.Job.update(job_id, { tags: merged });

    console.log(`autoTagJob: suggested ${suggested.join(', ')} for job ${job_id}`);
    return Response.json({ tags: merged, suggested });
  } catch (error) {
    console.error('autoTagJob error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});