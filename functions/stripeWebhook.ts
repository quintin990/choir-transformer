import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Stripe signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    console.log('Stripe webhook event:', event.type);

    const updateProfile = async (customerId, data) => {
      const profiles = await base44.asServiceRole.entities.Profile.filter({ stripe_customer_id: customerId });
      if (!profiles.length) { console.warn('No profile found for customer:', customerId); return; }
      await base44.asServiceRole.entities.Profile.update(profiles[0].id, data);
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode === 'subscription' && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await updateProfile(session.customer, {
          stripe_subscription_id: session.subscription,
          subscription_status: subscription.status === 'active' || subscription.status === 'trialing' ? subscription.status : 'active',
          plan: 'pro',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
      }
    } else if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const isPro = sub.status === 'active' || sub.status === 'trialing';
      await updateProfile(sub.customer, {
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        plan: isPro ? 'pro' : 'free',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await updateProfile(sub.customer, {
        subscription_status: 'canceled',
        plan: 'free',
        stripe_subscription_id: null,
        current_period_end: null,
      });
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('stripeWebhook error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});