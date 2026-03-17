import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { StripeService } from "./services/stripeService";
import nodemailer from "nodemailer";
import crypto from "node:crypto";
import { appendFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CRITICAL: Immediate startup log to a file to verify execution on Hostinger
try {
  const startupMsg = `\n[${new Date().toISOString()}] STARTUP ATTEMPT: Node ${process.version}, CWD: ${process.cwd()}, ENV: ${process.env.NODE_ENV}\n`;
  appendFileSync(path.join(process.cwd(), 'startup_log.txt'), startupMsg);
} catch (e) {
  console.error("Failed to write to startup_log.txt", e);
}

// Global error handlers to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Process] Uncaught Exception:', error);
  // Optional: process.exit(1) if you want a clean restart from the host
});

export async function createApp() {
  const app = express();
  
  // Default to production if not explicitly set and not on localhost
  if (!process.env.NODE_ENV && !process.env.APP_URL?.includes('localhost')) {
    process.env.NODE_ENV = 'production';
  }

  const PORT = process.env.PORT || 3000;
  console.log("Starting server with NODE_ENV:", process.env.NODE_ENV);
  console.log("PORT listening on:", PORT);

  app.use(cookieParser());

  // --- INITIALIZATION ---

  let db: admin.firestore.Firestore | null = null;
  try {
    let firebaseConfig;
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    try {
      firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.log("firebase-applet-config.json not found, trying environment variables...");
      if (process.env.FIREBASE_CONFIG) {
        firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
      } else {
        throw new Error("No Firebase configuration found (file or environment).");
      }
    }
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
        credential: firebaseConfig.clientEmail ? admin.credential.cert(firebaseConfig) : undefined
      });
    }
    const dbId = firebaseConfig.firestoreDatabaseId;
    db = (dbId && dbId !== "(default)") ? admin.firestore(dbId) : admin.firestore();
    console.log(`Firebase Admin initialized. Database: ${dbId || 'default'}`);
  } catch (error: any) {
    console.warn("Firebase Admin failed to initialize. Access to Firestore will be limited.", error.message);
    db = null;
  }

  let stripeClient: Stripe | null = null;
  const getStripe = async () => {
    if (stripeClient) return stripeClient;
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripeClient = new Stripe(key.trim(), { timeout: 10000, maxNetworkRetries: 0 });
      return stripeClient;
    }
    if (db) {
      try {
        const configDoc = await db.collection('config').doc('payment').get();
        if (configDoc.exists) {
          const cloudKey = configDoc.data()?.settings?.secretKey;
          if (cloudKey) {
            stripeClient = new Stripe(cloudKey.trim(), { timeout: 10000, maxNetworkRetries: 0 });
            return stripeClient;
          }
        }
      } catch (err) {
        console.error("[Stripe] Failed to fetch key from Firestore:", err);
      }
    }
    throw new Error("Transação interrompida: Chave secreta do Stripe não encontrada.");
  };

  // --- API ROUTER ---

  const apiRouter = express.Router();

  // 1. Webhook (Must be before JSON parse)
  apiRouter.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) return res.status(400).send("Webhook signature or secret missing");

    let event;
    try {
      event = await StripeService.verifyWebhookSignature(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const email = paymentIntent.metadata.customerEmail;
      const name = paymentIntent.metadata.customerName;

      if (db && email) {
        try {
          let uid: string;
          let generatedPassword = "";
          try {
            const userRecord = await admin.auth().getUserByEmail(email);
            uid = userRecord.uid;
          } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
              generatedPassword = crypto.randomBytes(6).toString('hex');
              const userRecord = await admin.auth().createUser({ email, password: generatedPassword, displayName: name || "" });
              uid = userRecord.uid;
              await db.collection('users').doc(uid).set({ email, displayName: name || "", role: 'client', hasSeenOnboarding: false, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
              
              // Email Logic
              try {
                const transporter = nodemailer.createTransport({
                  host: process.env.SMTP_HOST || "smtp.gmail.com",
                  port: Number(process.env.SMTP_PORT) || 587,
                  secure: process.env.SMTP_SECURE === 'true',
                  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                });
                await transporter.sendMail({
                  from: `"ViaLinks" <${process.env.SMTP_USER}>`,
                  to: email,
                  subject: "Bem-vindo à ViaLinks!",
                  html: `<p>Sua senha: ${generatedPassword}</p>`
                });
              } catch (e) {}
            } else throw error;
          }
          await db.collection('sales').add({ userId: uid, customerEmail: email, customerName: name || "", amount: paymentIntent.amount / 100, stripeId: paymentIntent.id, status: 'paid', items: paymentIntent.metadata.items ? JSON.parse(paymentIntent.metadata.items) : [], createdAt: admin.firestore.FieldValue.serverTimestamp() });
          try { await db.collection('abandoned_carts').doc(email).update({ status: 'converted', convertedAt: admin.firestore.FieldValue.serverTimestamp() }); } catch (e) {}
        } catch (err: any) { console.error("[Webhook] Error:", err.message); }
      }
    }
    res.json({ received: true });
  });

  apiRouter.use(express.json());

  apiRouter.get("/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV, uptime: process.uptime() }));
  apiRouter.get("/ping", (req, res) => res.json({ pong: true, time: new Date().toISOString() }));
  apiRouter.post("/auth/logout", (req, res) => { res.clearCookie("token"); res.json({ success: true }); });

  apiRouter.get("/plans", async (req, res) => {
    let plans: any[] = [];
    try {
      if (db) {
        const plansSnapshot = await db.collection('config').doc('plans').get();
        if (plansSnapshot.exists) plans = plansSnapshot.data()?.plans || [];
      }
      res.json(plans);
    } catch (error: any) { res.json([]); }
  });

  apiRouter.post("/admin/send-email", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: "No authorization token" });
      const decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
      if (db) {
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || userDoc.data()?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
      }
      const { recipients, subject, html } = req.body;
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await Promise.all(recipients.map((email: string) => transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject, html })));
      res.json({ success: true });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  apiRouter.post("/create-payment-intent", async (req, res) => {
    try {
      const { items, email, name, phone, taxId } = req.body;
      if (!items?.length) return res.status(400).json({ error: "Carrinho vazio." });
      let total = 0;
      if (db) {
        try {
          const plans = (await db.collection('config').doc('plans').get()).data()?.plans || [];
          for (const item of items) {
            const plan = plans.find((p: any) => p.id === item.id);
            if (plan) total += plan.price * (item.quantity || 1);
          }
        } catch (e) {}
      }
      if (total === 0) total = items.reduce((sum: number, item: any) => sum + (Number(item.numericPrice) * (item.quantity || 1)), 0);
      const stripe = await getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'brl',
        receipt_email: email,
        payment_method_types: ['card'],
        metadata: { customerName: name || "", customerEmail: email || "", customerPhone: phone || "", taxId: taxId || "", items: JSON.stringify(items.map((i: any) => i.id)) }
      });
      if (db && email) {
        try { await db.collection('abandoned_carts').doc(email).set({ email, name, items, amount: total, status: 'pending', paymentIntentId: paymentIntent.id }, { merge: true }); } catch (e) {}
      }
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  apiRouter.post("/create-checkout-session", async (req, res) => {
    try {
      const { items, email, name, phone, taxId } = req.body;
      const stripe = await getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({ price_data: { currency: 'brl', product_data: { name: item.name }, unit_amount: Math.round(item.numericPrice * 100) }, quantity: item.quantity })),
        mode: 'payment',
        customer_email: email,
        success_url: `${process.env.APP_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/?view=checkout`,
        metadata: { customerName: name || "", customerPhone: phone || "", taxId: taxId || "" }
      });
      res.json({ url: session.url });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  apiRouter.get("/checkout/verify", async (req, res) => {
    try {
      const { session_id, payment_intent } = req.query;
      const stripe = await getStripe();
      if (session_id) {
        const session: any = await stripe.checkout.sessions.retrieve(session_id as string);
        if (session.payment_status === 'paid') return res.json({ success: true, email: session.customer_details.email, amount: session.amount_total / 100 });
      } else if (payment_intent) {
        const pi: any = await stripe.paymentIntents.retrieve(payment_intent as string);
        if (pi.status === 'succeeded') return res.json({ success: true, email: pi.receipt_email, amount: pi.amount / 100 });
      }
      res.status(400).json({ error: "Payment not completed" });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  apiRouter.all('*', (req, res) => res.status(404).json({ error: `Not Found: ${req.url}` }));

  // --- MOUNTING ---
  app.use("/api", apiRouter);
  app.use("/", apiRouter);

  // --- STATIC / VITE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return app;
}

// Start server if this file is run directly
if (import.meta.url === `file://${fileURLToPath(import.meta.url)}` || process.env.VITE_DEV_SERVER) {
  createApp().then(app => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    const errMsg = `[${new Date().toISOString()}] CRITICAL STARTUP ERROR: ${err.message}\n${err.stack}\n`;
    console.error(errMsg);
    try {
      appendFileSync(path.join(process.cwd(), 'startup_log.txt'), errMsg);
    } catch (e) {}
    process.exit(1);
  });
}

export default createApp;
