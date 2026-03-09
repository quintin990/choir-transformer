import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@16.7.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or get Stripe customer
    let customerId = null;
    const profiles = await base44.asServiceRole.entities.Profile.filter({
      user_id: user.id,
    });

    if (profiles.length > 0 && profiles[0].stripe_customer_id) {
      customerId = profiles[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.Profile.update(profiles[0].id, {
          stripe_customer_id: customerId,
        });
      } else {
        await base44.asServiceRole.entities.Profile.create({
          user_id: user.id,
          stripe_customer_id: customerId,
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Auralyn Pro' },
            unit_amount: 999, // $9.99
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/billing-success`,
      cancel_url: `${Deno.env.get('APP_URL')}/billing-cancel`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});