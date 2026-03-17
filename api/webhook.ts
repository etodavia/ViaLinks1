import Stripe from "stripe";
import admin from "firebase-admin";

// 1. Lite Firebase Init
function initFirebase() {
  if (!admin.apps.length) {
    const firebaseConfig = process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : null;
    if (firebaseConfig) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
        credential: firebaseConfig.clientEmail ? admin.credential.cert(firebaseConfig) : undefined
      });
    }
  }
  return admin.apps.length ? admin.firestore() : null;
}

// 2. Lite Stripe Getting
async function getStripe(db: admin.firestore.Firestore | null) {
  let key = process.env.STRIPE_SECRET_KEY;
  if (!key && db) {
    try {
      const configDoc = await db.collection('config').doc('payment').get();
      key = configDoc.data()?.settings?.secretKey;
    } catch (err) {
      console.error("[Webhook] Failed Stripe key fetch:", err);
    }
  }
  if (!key) throw new Error("Missing Stripe Key");
  return new Stripe(key.trim(), { apiVersion: '2025-01-27' as any });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("[Webhook] Missing sig or secret");
    return res.status(400).send('Webhook Error: Missing signature or secret');
  }

  try {
    const db = initFirebase();
    const stripe = await getStripe(db);
    
    // Vercel handles raw body or we might need it if buffer is available.
    // In Vercel serverless functions, `req.body` might be already parsed.
    // However, Stripe needs the RAW body for signature verification.
    
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[Webhook] Payment success for session:", session.id);
      
      if (db) {
        await db.collection('payments').add({
          sessionId: session.id,
          email: session.customer_email,
          amount: session.amount_total,
          status: 'completed',
          metadata: session.metadata,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`[Webhook] Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
