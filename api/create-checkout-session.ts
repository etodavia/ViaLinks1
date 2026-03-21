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
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Carrinho está vazio." });
    }

    const parsePrice = (price: any): number => {
      if (typeof price === 'number') return price;
      if (!price) return 0;
      const cleaned = String(price).replace(/[^\d.,]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const baseUrl = process.env.APP_URL || (req.headers.host ? `https://${req.headers.host}` : "");
    
    // Save record to sales collection as a lead (Backend uses admin privileges)
    if (db) {
      try {
        let total = 0;
        const lineItems = items.map((item: any) => {
          const unitPrice = parsePrice(item.numericPrice || item.price);
          total += unitPrice * (item.quantity || 1);
          return {
            id: item.id || "unspecified",
            name: item.name,
            quantity: item.quantity || 1,
            numericPrice: unitPrice
          };
        });

        await db.collection("sales").add({
          email,
          name: name || "",
          phone: phone || "",
          taxId: taxId || "",
          amount: total,
          items: lineItems,
          status: "pending_payment",
          type: "lead_redirect_api",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (saveErr) {
        console.warn("[Admin] Failed to save pre-checkout lead:", saveErr);
      }
    }

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
      success_url: `${baseUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?view=checkout`,
      metadata: { customerName: name || "", customerPhone: phone || "", taxId: taxId || "" }
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("[Function] Checkout Error:", err.message);
    return res.status(500).json({ error: "Checkout Failed", message: err.message });
  }
}
