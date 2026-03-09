import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { priceId } = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const appUrl = Deno.env.get('APP_URL') || 'https://localhost:3000';

    // Get or create profile
    const profiles = await base44.entities.Profile.filter({ user_id: user.id });
    let profile = profiles[0];

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || undefined,
        metadata: { base44_user_id: user.id },
      });
      customerId = customer.id;
      if (profile) {
        await base44.entities.Profile.update(profile.id, { stripe_customer_id: customerId });
      } else {
        profile = await base44.entities.Profile.create({ user_id: user.id, stripe_customer_id: customerId, plan: 'free', subscription_status: 'none' });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId || Deno.env.get('STRIPE_PRICE_PRO_MONTHLY'), quantity: 1 }],
      success_url: `${appUrl}/billing/success`,
      cancel_url: `${appUrl}/billing/cancel`,
      metadata: { base44_app_id: Deno.env.get('BASE44_APP_ID'), base44_user_id: user.id },
    });

    console.log('Checkout session created:', session.id);
    return Response.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});