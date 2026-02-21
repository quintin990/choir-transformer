import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function for scheduled cleanup
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Find expired jobs
    const allJobs = await base44.asServiceRole.entities.Job.list();
    const expiredJobs = allJobs.filter(job => 
      job.retention_delete_at && job.retention_delete_at < now
    );

    let deletedCount = 0;
    let errorCount = 0;

    for (const job of expiredJobs) {
      try {
        // Delete job and associated events
        await base44.asServiceRole.entities.JobEvent.delete({ job_id: job.id });
        await base44.asServiceRole.entities.Job.delete(job.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete job ${job.id}:`, error);
        errorCount++;
      }
    }

    return Response.json({
      status: 'success',
      deleted: deletedCount,
      errors: errorCount,
      total_expired: expiredJobs.length
    });
  } catch (error) {
    console.error('Error cleaning up expired jobs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});