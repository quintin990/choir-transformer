import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Credit amounts awarded per price ID
const PRICE_CREDITS = {
  'price_1T5EKdDPbH08DQTSKlDbkN4g': { credits: 100, plan: 'starter' }, // Starter $19/mo
  'price_1T5EKdDPbH08DQTSl2DwUVTR': { credits: 500, plan: 'pro' },     // Pro $49/mo
  'price_1T5EKdDPbH08DQTSth4zYs4s': { credits: 50,  plan: null },      // Pack 50
  'price_1T5EKdDPbH08DQTSVM0aBeDy': { credits: 200, plan: null },      // Pack 200
  'price_1T5EKdDPbH08DQTSdbCONpkJ': { credits: 500, plan: null },      // Pack 500
};

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.customer_email || session.metadata?.user_email;
      if (!userEmail) return Response.json({ received: true });

      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
      if (!users.length) return Response.json({ received: true });
      const user = users[0];

      // Get line items to determine what was purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      for (const item of lineItems.data) {
        const priceId = item.price?.id;
        const mapping = PRICE_CREDITS[priceId];
        if (!mapping) continue;

        const updates = { credits: (user.credits || 0) + mapping.credits };
        if (mapping.plan) {
          updates.plan = mapping.plan;
          updates.stripe_subscription_id = session.subscription || undefined;
          updates.stripe_customer_id = session.customer || undefined;
        }
        await base44.asServiceRole.entities.User.update(user.id, updates);
        console.log(`Granted ${mapping.credits} credits to ${userEmail}${mapping.plan ? `, plan: ${mapping.plan}` : ''}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const users = await base44.asServiceRole.entities.User.filter({ stripe_subscription_id: sub.id });
      if (users.length) {
        await base44.asServiceRole.entities.User.update(users[0].id, { plan: 'free', stripe_subscription_id: null });
        console.log(`Subscription cancelled for user ${users[0].email}, downgraded to free`);
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  return Response.json({ received: true });
});