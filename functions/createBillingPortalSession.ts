import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    const profile = profiles[0];
    if (!profile?.stripe_customer_id) {
      return Response.json({ error: 'No billing account found. Please subscribe first.' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const appUrl = Deno.env.get('APP_URL') || 'https://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    console.log('Billing portal session created:', session.id);
    return Response.json({ portalUrl: session.url });
  } catch (err) {
    console.error('createBillingPortalSession error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});