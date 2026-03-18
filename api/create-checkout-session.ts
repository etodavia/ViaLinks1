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
      console.error("[Function] Failed Stripe key fetch:", err);
    }
  }
  if (!key) throw new Error("Missing Stripe Key");
  return new Stripe(key.trim(), { apiVersion: '2024-11-20.acacia' as any });
}

export default async function handler(req: any, res: any) {
  // CORS & Headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const db = initFirebase();
    const stripe = await getStripe(db);
    const { items, email, name, phone, taxId } = req.body;

    console.log("[Function] Creating session for:", email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: { name: item.name },
          unit_amount: Math.round(item.numericPrice * 100)
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.APP_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/?view=checkout`,
      metadata: { customerName: name || "", customerPhone: phone || "", taxId: taxId || "" }
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("[Function] Checkout Error:", err.message);
    return res.status(500).json({ error: "Checkout Failed", message: err.message });
  }
}
