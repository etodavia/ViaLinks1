import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import admin from "firebase-admin";
import { readFileSync, existsSync } from "node:fs";

// Internal imports
import { StripeService } from "./services/stripeService";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Startup log
console.log(`[Server] Persistent Server Loading. NODE_ENV: ${process.env.NODE_ENV}`);

export async function createApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());

  // --- PERSISTENT INITIALIZATION ---

  // 1. Firebase
  let db: admin.firestore.Firestore | null = null;
  try {
    let firebaseConfig: any = null;
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (process.env.FIREBASE_CONFIG) {
      firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
    } else if (existsSync(configPath)) {
      firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    }

    if (firebaseConfig) {
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: firebaseConfig.projectId,
          credential: firebaseConfig.clientEmail ? admin.credential.cert(firebaseConfig) : undefined
        });
      }
      db = admin.firestore();
      console.log("[Firebase] Persistent connection established.");
    }
  } catch (error: any) {
    console.error("[Firebase] Init Error:", error.message);
  }

  // 2. Stripe
  let stripeClient: Stripe | null = null;
  const getStripe = async () => {
    if (stripeClient) return stripeClient;
    let key = process.env.STRIPE_SECRET_KEY;
    if (!key && db) {
      const configDoc = await db.collection('config').doc('payment').get();
      key = configDoc.data()?.settings?.secretKey;
    }
    if (!key) throw new Error("Stripe Key Missing");
    stripeClient = new Stripe(key.trim(), { apiVersion: '2024-11-20.acacia' as any });
    return stripeClient;
  };

  const parsePrice = (price: any): number => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    const cleaned = String(price).replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // --- API ROUTES ---
  const apiRouter = express.Router();

  apiRouter.get("/health", (req, res) => res.json({ status: "ok", mode: "persistent", time: new Date().toISOString() }));
  apiRouter.get("/ping", (req, res) => res.json({ status: "alive (persistent)", time: new Date().toISOString() }));
  apiRouter.post("/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  apiRouter.get("/plans", async (req, res) => {
    try {
      if (!db) return res.json([]);
      const plansSnapshot = await db.collection('plans').orderBy('order', 'asc').get();
      const plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      res.json(plans);
    } catch (error) {
      console.error("[API] Plans Error:", error);
      res.json([]);
    }
  });

  apiRouter.get("/checkout/verify", async (req, res) => {
    try {
      const { session_id, payment_intent } = req.query;
      const stripe = await getStripe();
      
      if (session_id) {
        const session = await stripe.checkout.sessions.retrieve(session_id as string);
        if (session.payment_status === 'paid') {
          return res.json({ 
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
          return res.json({ 
            success: true, 
            email: pi.receipt_email, 
            amount: pi.amount / 100,
            stripe_id: pi.id,
            status: pi.status
          });
        }
      }
      res.status(400).json({ error: "Payment not completed" });
    } catch (error: any) {
      console.error("[API] Verify Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/create-checkout-session", async (req, res) => {
    try {
      const { items, email, name, phone, taxId } = req.body;
      const stripe = await getStripe();
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
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("[API] Checkout Error:", error);
      res.status(500).json({ error: "Checkout Failed", message: error.message });
    }
  });

  apiRouter.post("/create-payment-intent", async (req, res) => {
    try {
      const { items, email, name, phone, taxId } = req.body;
      if (!items?.length) return res.status(400).json({ error: "Carrinho vazio." });

      let total = 0;
      if (db) {
        try {
          const plansSnapshot = await db.collection('plans').get();
          const plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
          for (const item of items) {
            const plan = plans.find((p: any) => p.id === item.id);
            if (plan) total += (parsePrice(plan.numericPrice || plan.price)) * (item.quantity || 1);
          }
        } catch (e) {
          console.warn("[API] Failed to fetch plans from Firestore for amount calculation:", e);
        }
      }

      if (total <= 0) {
        total = items.reduce((sum: number, item: any) => sum + (parsePrice(item.numericPrice || item.price) * (item.quantity || 1)), 0);
      }

      if (total <= 0) throw new Error("O valor total do pedido deve ser maior que zero.");

      const stripe = await getStripe();
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

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("[API] PaymentIntent Error:", error.message);
      res.status(500).json({ error: "Checkout Failed", message: error.message });
    }
  });

  apiRouter.all('*', (req, res) => res.status(404).json({ error: `Not Found: ${req.url}` }));

  // --- STATIC / SPA MOUNTING ---
  app.use("/api", apiRouter);

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*path', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: "API route not found" });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode with Vite
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }

  return app;
}

// Global Start
const PORT = process.env.PORT || 10000;
createApp().then(app => {
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 [Server] Real-time engine active on port ${PORT}`);
    console.log(`🔗 [Server] Binding: http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("❌ [Server] Fatal startup error:", err);
  process.exit(1);
});
