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
      console.log("[Lite] Firebase Initialized");
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
      console.error("[Lite] Failed Stripe key fetch:", err);
    }
  }
  if (!key) throw new Error("Missing Stripe Secret Key");
  return new Stripe(key.trim(), { apiVersion: '2025-01-27' as any });
}

function parsePrice(price: any): number {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export default async function handler(req: any, res: any) {
  // CORS & Headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url || "";
  console.log(`[Lite Handler] Request: ${req.method} ${path}`);

  // Fast Health Check
  if (path.includes('health-check') || path.includes('ping')) {
    return res.status(200).json({ status: "alive (lite)", time: new Date().toISOString() });
  }

  // GET PLANS
  if (path.includes('plans') && req.method === 'GET') {
    try {
      const db = initFirebase();
      if (!db) return res.status(200).json([]);
      const plansSnapshot = await db.collection('config').doc('plans').get();
      const plans = plansSnapshot.exists ? (plansSnapshot.data()?.plans || []) : [];
      return res.status(200).json(plans);
    } catch (err) {
      return res.status(200).json([]);
    }
  }

  // VERIFY CHECKOUT
  if (path.includes('checkout/verify') && req.method === 'GET') {
    try {
      const db = initFirebase();
      const stripe = await getStripe(db);
      const { session_id, payment_intent } = req.query;

      if (session_id) {
        const session = await stripe.checkout.sessions.retrieve(session_id as string);
        if (session.payment_status === 'paid') {
          return res.status(200).json({ 
            success: true, 
            email: session.customer_details?.email, 
            amount: (session.amount_total || 0) / 100,
            stripe_id: session.id,
            status: session.status
          });
        }
      } else if (payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(payment_intent as string);
        if (pi.status === 'succeeded') {
          return res.status(200).json({ 
            success: true, 
            email: pi.receipt_email, 
            amount: pi.amount / 100,
            stripe_id: pi.id,
            status: pi.status
          });
        }
      }
      return res.status(400).json({ error: "Payment not completed" });
    } catch (err: any) {
      return res.status(500).json({ error: "Verification Failed", message: err.message });
    }
  }

  // CREATE CHECKOUT SESSION (The only one we need for now)
  if (path.includes('create-checkout-session') && req.method === 'POST') {
    try {
      const db = initFirebase();
      const stripe = await getStripe(db);
      const { items, email, name, phone, taxId } = req.body;

      console.log("[Lite] Creating session for:", email);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => {
          const unitAmount = Math.round(parsePrice(item.numericPrice || item.price) * 100);
          if (unitAmount <= 0) throw new Error(`Preço inválido para o item: ${item.name}`);
          return {
            price_data: {
              currency: 'brl',
              product_data: { name: item.name },
              unit_amount: unitAmount
            },
            quantity: item.quantity || 1
          };
        }),
        mode: 'payment',
        customer_email: email,
        success_url: `${process.env.APP_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/?view=checkout`,
        metadata: { customerName: name || "", customerPhone: phone || "", taxId: taxId || "" }
      });

      return res.status(200).json({ url: session.url });
    } catch (err: any) {
      console.error("[Lite] Checkout Error:", err.message);
      return res.status(500).json({ error: "Checkout Failed", message: err.message });
    }
  }

  // CREATE PAYMENT INTENT
  if (path.includes('create-payment-intent') && req.method === 'POST') {
    try {
      const db = initFirebase();
      const stripe = await getStripe(db);
      const { items, email, name, phone, taxId } = req.body;
      if (!items?.length) return res.status(400).json({ error: "Carrinho vazio." });

      let total = 0;
      if (db) {
        try {
          const plansDoc = await db.collection('config').doc('plans').get();
          const plans = plansDoc.data()?.plans || [];
          for (const item of items) {
            const plan = plans.find((p: any) => p.id === item.id);
            if (plan) total += (parsePrice(plan.numericPrice || plan.price)) * (item.quantity || 1);
          }
        } catch (e) {}
      }

      if (total <= 0) {
        total = items.reduce((sum: number, item: any) => sum + (parsePrice(item.numericPrice || item.price) * (item.quantity || 1)), 0);
      }

      if (total <= 0) throw new Error("O valor total do pedido deve ser maior que zero.");

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'brl',
        receipt_email: email,
        payment_method_types: ['card'],
        metadata: { 
          customerName: name || "", 
          customerEmail: email || "", 
          customerPhone: phone || "", 
          taxId: taxId || "", 
          items: JSON.stringify(items.map((i: any) => i.id)) 
        }
      });

      if (db && email) {
        try {
          await db.collection('abandoned_carts').doc(email).set({ 
            email, name, items, amount: total, status: 'pending', paymentIntentId: paymentIntent.id, updatedAt: admin.firestore.FieldValue.serverTimestamp() 
          }, { merge: true });
        } catch (e) {}
      }

      return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err: any) {
      return res.status(500).json({ error: "PaymentIntent Failed", message: err.message });
    }
  }

  // FALLBACK TO EXPRESS APP (For other routes, if they work)
  try {
    console.log("[Lite] Falling back to Express for other routes...");
    const { createApp } = await import("../server.ts");
    const app = await createApp();
    return app(req, res);
  } catch (err: any) {
    return res.status(404).json({ error: "Not Found", message: `Lite handler could not resolve route: ${path}` });
  }
}
