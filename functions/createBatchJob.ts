import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      files_count, 
      separation_mode, 
      separation_model,
      output_format, 
      output_settings,
      apply_repair 
    } = await req.json();

    if (!files_count || files_count < 1) {
      return Response.json({ error: 'Invalid files count' }, { status: 400 });
    }

    // Create batch job record
    const batchJob = await base44.entities.BatchJob.create({
      title: `Batch Processing (${files_count} files)`,
      total_files: files_count,
      completed_files: 0,
      failed_files: 0,
      status: 'processing',
      separation_mode,
      separation_model,
      output_format,
      output_settings: output_settings || {},
      apply_repair: apply_repair || false
    });

    return Response.json({ 
      status: 'success', 
      batch_job_id: batchJob.id 
    });
  } catch (error) {
    console.error('Error creating batch job:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});