import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    const profile = profiles[0];

    return Response.json({
      plan: profile?.plan || 'free',
      subscription_status: profile?.subscription_status || 'none',
      current_period_end: profile?.current_period_end || null,
    });
  } catch (err) {
    console.error('syncProfilePlan error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});