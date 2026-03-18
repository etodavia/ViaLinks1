import Stripe from 'stripe';

export class StripeService {
  private static stripe: Stripe | null = null;

  private static async getStripe() {
    if (this.stripe) return this.stripe;

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY not found in environment variables.");
    }

    this.stripe = new Stripe(key, {
      apiVersion: '2024-11-20.acacia' as any,
    });
    return this.stripe;
  }

  static async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }) {
    const stripe = await this.getStripe();
    return await stripe.paymentIntents.create({
      amount: Math.round(params.amount),
      currency: params.currency,
      receipt_email: params.customerEmail,
      metadata: params.metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  static async verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string) {
    const stripe = await this.getStripe();
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
