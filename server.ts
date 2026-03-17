import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { StripeService } from "./services/stripeService.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Global error handlers to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Process] Uncaught Exception:', error);
  // Optional: process.exit(1) if you want a clean restart from the host
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  console.log("Starting server with NODE_ENV:", process.env.NODE_ENV);
  console.log("APP_URL configured as:", process.env.APP_URL || `http://localhost:${PORT} (default)`);
  console.log("PORT listening on:", PORT);
  console.log("Stripe Secret Key present in ENV:", !!process.env.STRIPE_SECRET_KEY);
  if (process.env.STRIPE_SECRET_KEY) {
    console.log("Stripe Secret Key starts with:", process.env.STRIPE_SECRET_KEY.substring(0, 7));
  }
  
  let db: admin.firestore.Firestore | null = null;
  
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
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
  let lastKeyFetchTime = 0;
  let currentKey: string | null = null;

  const getStripe = async () => {
    if (stripeClient) return stripeClient;
    
    // Always prefer ENV for debugging/emergency fallback
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      console.log("[Stripe] Using Secret Key from environment.");
      stripeClient = new Stripe(key.trim(), {
        timeout: 10000, // 10 seconds timeout
        maxNetworkRetries: 0 // Fail fast
      });
      return stripeClient;
    }

    // Fallback to Firestore if key is not in ENV
    if (db) {
      try {
        const configDoc = await db.collection('config').doc('payment').get();
        if (configDoc.exists) {
          const cloudKey = configDoc.data()?.settings?.secretKey;
          if (cloudKey) {
            stripeClient = new Stripe(cloudKey.trim(), {
              timeout: 10000,
              maxNetworkRetries: 0
            });
            return stripeClient;
          }
        }
      } catch (err) {
        console.error("[Stripe] Failed to fetch key from Firestore:", err);
      }
    }

    throw new Error("Transação interrompida: Chave secreta do Stripe não encontrada.");
  };

  app.use(cookieParser());

  // Stripe Webhook MUST stay BEFORE global body parsers to get the raw body
  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log("[Webhook] Received signature header:", !!sig);

    if (!sig || !webhookSecret) {
      console.error("[Webhook] Missing sig or secret", { sig: !!sig, secret: !!webhookSecret });
      return res.status(400).send("Webhook signature or secret missing");
    }

    let event;
    try {
      event = await StripeService.verifyWebhookSignature(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`[Webhook] Signature Verification Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      console.log(`[Webhook] PaymentIntent for ${paymentIntent.amount} succeeded!`);
      
      const email = paymentIntent.metadata.customerEmail;
      const name = paymentIntent.metadata.customerName;

      if (db && email) {
        try {
          // 1. Try to create/get user in Auth
          let uid: string;
          let generatedPassword = "";
          try {
            const userRecord = await admin.auth().getUserByEmail(email);
            uid = userRecord.uid;
            console.log(`[Webhook] User ${email} already exists.`);
          } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
              // Generate a secure random password
              generatedPassword = crypto.randomBytes(6).toString('hex'); // 12 characters hex
              
              const userRecord = await admin.auth().createUser({
                email,
                password: generatedPassword,
                displayName: name || "",
              });
              uid = userRecord.uid;
              console.log(`[Webhook] Created new Auth user: ${email} with password: ${generatedPassword}`);
              
              // Create user document in Firestore
              await db.collection('users').doc(uid).set({
                email,
                displayName: name || "",
                role: 'client',
                hasSeenOnboarding: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });

              // Send Welcome Email
              try {
                const transporter = nodemailer.createTransport({
                  host: process.env.SMTP_HOST || "smtp.gmail.com",
                  port: Number(process.env.SMTP_PORT) || 587,
                  secure: process.env.SMTP_SECURE === 'true',
                  auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                  },
                });

                // Fetch Welcome Template from Firestore
                let welcomeSubject = "Bem-vindo à ViaLinks! Seus dados de acesso";
                let welcomeHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
                      <div style="background-color: #6366f1; padding: 40px; text-align: center; border-radius: 20px 20px 0 0;">
                        <h1 style="color: white; margin: 0;">Bem-vindo à ViaLinks!</h1>
                      </div>
                      <div style="padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 20px 20px; background-color: white;">
                        <p>Olá <strong>{{name}}</strong>,</p>
                        <p>Parabéns pela sua compra! Seu acesso ao painel ViaLinks já está liberado.</p>
                        <p>Aqui estão seus dados de login:</p>
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                          <p style="margin: 5px 0;"><strong>E-mail:</strong> {{email}}</p>
                          <p style="margin: 5px 0;"><strong>Senha:</strong> <span style="color: #6366f1; font-weight: bold;">{{password}}</span></p>
                        </div>
                        <p>Você pode acessar sua conta agora mesmo pelo link abaixo:</p>
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${process.env.APP_URL || 'https://vialinks.com.br'}" style="background-color: #f97316; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold;">Acessar Meu Painel</a>
                        </div>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">ViaLinks - Revolucionando sua presença profissional.</p>
                      </div>
                    </div>
                `;

                try {
                  const templateDoc = await db.collection('config').doc('emailTemplates').get();
                  if (templateDoc.exists) {
                    const data = templateDoc.data();
                    if (data?.welcome) {
                      welcomeSubject = data.welcome.subject || welcomeSubject;
                      welcomeHtml = data.welcome.html || welcomeHtml;
                    }
                  }
                } catch (err) {
                  console.warn("[Webhook] Failed to fetch email templates from Firestore:", err.message);
                }

                // Simple template replacement
                const finalHtml = welcomeHtml
                  .replace(/{{name}}/g, name || 'cliente')
                  .replace(/{{email}}/g, email)
                  .replace(/{{password}}/g, generatedPassword);

                const mailOptions = {
                  from: `"ViaLinks" <${process.env.SMTP_USER}>`,
                  to: email,
                  subject: welcomeSubject,
                  html: finalHtml
                };

                await transporter.sendMail(mailOptions);
                console.log(`[Webhook] Welcome email sent to ${email}`);
              } catch (emailErr: any) {
                console.error("[Webhook] Failed to send welcome email:", emailErr.message);
              }
            } else {
              throw error;
            }
          }

          // 2. Record the order (sales collection is also used in frontend)
          const salesRef = db.collection('sales');
          await salesRef.add({
            userId: uid,
            customerEmail: email,
            customerName: name || "",
            amount: paymentIntent.amount / 100,
            stripeId: paymentIntent.id,
            status: 'paid',
            items: paymentIntent.metadata.items ? JSON.parse(paymentIntent.metadata.items) : [],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`[Webhook] Sale recorded for ${email}`);

          // 3. Mark abandoned cart as converted
          try {
            await db.collection('abandoned_carts').doc(email).update({
              status: 'converted',
              convertedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } catch (cartErr: any) {
            // Cart might not exist if they bypassed the normal intent creation
            console.log(`[Webhook] No abandoned cart found for ${email} to convert.`);
          }
        } catch (err: any) {
          console.error("[Webhook] Error processing success event:", err.message);
        }
      }
    }

    res.json({ received: true });
  });
  
  app.use(express.json());


  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
  });

  // Ping endpoint for fast frontend checks
  app.get("/api/ping", (req, res) => {
    res.json({ pong: true, time: new Date().toISOString() });
  });

  // API Routes
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // Plans API (solves Firestore permission issues for landing page)
  app.get("/api/plans", async (req, res) => {
    let plans: any[] = [];
    try {
      if (db) {
        const plansSnapshot = await db.collection('config').doc('plans').get();
        if (plansSnapshot.exists) {
          plans = plansSnapshot.data()?.plans || [];
        }
      }
      res.json(plans);
    } catch (error: any) {
      console.warn("[Plans] Firestore connection failed or permissions missing. Returning empty array.");
      res.json([]);
    }
  });

  // Admin Email API
  app.post("/api/admin/send-email", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No authorization token" });
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Verify admin role in Firestore
      if (db) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
          return res.status(403).json({ error: "Forbidden: Admin access required" });
        }
      } else {
        return res.status(500).json({ error: "Database not available" });
      }

      const { recipients, subject, html } = req.body;
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: "No recipients specified" });
      }

      console.log(`[Admin Email] Sending campaign: "${subject}" to ${recipients.length} recipients...`);

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Send emails (using for-of for more controlled bulk sending, though Promise.all is faster)
      // For a small number of users Promise.all is fine.
      const sendPromises = recipients.map(email => {
        return transporter.sendMail({
          from: `"ViaLinks Admin" <${process.env.SMTP_USER}>`,
          to: email,
          subject: subject,
          html: html
        });
      });

      await Promise.all(sendPromises);

      res.json({ success: true, message: `Email enviado para ${recipients.length} destinatários.` });
    } catch (error: any) {
      console.error("[Admin Email] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe PaymentIntent (for Elements)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { items, email, name, phone, taxId } = req.body;
      console.log("[PaymentIntent] Request received:", { email, name, phone, taxId, itemsCount: items?.length });
      console.log("[PaymentIntent] Items:", JSON.stringify(items));

      console.log("[PaymentIntent] Received request for:", email, "items:", JSON.stringify(items));

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Carrinho vazio ou inválido." });
      }

      // Force guest mode if we suspect auth issues or db is null
      let total = 0;
      let usedDb = false;
      if (db) {
        try {
          const plansSnapshot = await db.collection('config').doc('plans').get();
          const plansData = plansSnapshot.data();
          const plans = plansData?.plans || [];
          
          if (plans.length > 0) {
            for (const item of items) {
              const plan = plans.find((p: any) => p.id === item.id);
              if (plan) {
                total += (plan.price || 0) * (item.quantity || 1);
                usedDb = true;
              }
            }
          }
        } catch (error) {
          console.warn("[Plans] Firestore connection failed or missing permissions. Falling back.");
        }
      }

      if (!usedDb) {
        total = items.reduce((sum, item) => {
          const price = Number(item.numericPrice);
          if (isNaN(price)) {
            console.warn(`[PaymentIntent] Invalid numericPrice for item ${item.id}:`, item.numericPrice);
            return sum;
          }
          return sum + (price * (Number(item.quantity) || 1));
        }, 0);
      }

      console.log("[PaymentIntent] Calculated total (real):", total);

      if (isNaN(total) || total <= 0) {
        console.error("[PaymentIntent] Invalid calculated total:", total);
        return res.status(400).json({ error: "O valor total do pedido é inválido ou zero." });
      }

      // Stripe expects amount in cents
      const amountInCents = Math.round(total * 100);
      console.log("[PaymentIntent] Calculated amount in cents:", amountInCents);

      if (amountInCents <= 0) {
        console.error("[PaymentIntent] Invalid amount:", amountInCents);
        return res.status(400).json({ error: "O valor total da compra deve ser superior a zero." });
      }

      // Use the local stripe client instead of the service if it's simpler
      const stripe = await getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'brl',
        receipt_email: email,
        payment_method_types: ['card'],
        metadata: {
          customerName: name || "",
          customerEmail: email || "",
          customerPhone: phone || "",
          taxId: taxId || "",
          items: JSON.stringify(items.map(i => i.id))
        }
      });

      // Abandoned Cart tracking
      if (db && email) {
        try {
          await db.collection('abandoned_carts').doc(email).set({
            email,
            name: name || "",
            items: items,
            amount: total,
            lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            paymentIntentId: paymentIntent.id
          }, { merge: true });
        } catch (dbErr) {
          console.warn("[AbandonedCart] Failed to track attempt:", dbErr);
        }
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("[PaymentIntent] CRITICAL ERROR:", error);
      res.status(500).json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  });

  // Stripe Checkout Session (Robust Hosted Method)
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { items, email, name, phone, taxId } = req.body;
      const stripe = await getStripe();

      console.log("[CheckoutSession] Creating session for:", email);

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Carrinho vazio ou inválido." });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'brl',
            product_data: {
              name: item.name,
              metadata: { id: item.id }
            },
            unit_amount: Math.round((item.numericPrice || 0) * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        customer_email: email,
        success_url: `${process.env.APP_URL || 'http://localhost:3333'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3333'}/?view=checkout`,
        metadata: {
          customerName: name || "",
          customerPhone: phone || "",
          taxId: taxId || ""
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("[CheckoutSession] Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify Purchase
  app.get("/api/checkout/verify", async (req, res) => {
    const { session_id, payment_intent } = req.query;
    if (!session_id && !payment_intent) return res.status(400).json({ error: "Missing session_id or payment_intent" });

    try {
      const stripe = await getStripe();
      if (session_id) {
        const session: any = await stripe.checkout.sessions.retrieve(session_id as string);
        if (session.payment_status === 'paid') {
          return res.json({ 
            success: true, 
            email: session.customer_details.email,
            amount: session.amount_total / 100,
            stripe_id: session.id
          });
        }
      } else if (payment_intent) {
        const pi: any = await stripe.paymentIntents.retrieve(payment_intent as string);
        if (pi.status === 'succeeded' || pi.status === 'processing') {
          return res.json({ 
            success: true, 
            status: pi.status,
            email: pi.metadata.customerEmail || pi.receipt_email,
            amount: pi.amount / 100,
            stripe_id: pi.id
          });
        }
      }
      res.status(400).json({ error: "Payment not completed" });
    } catch (error: any) {
      console.error("[Verify] API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Defensive API catch-all to prevent falling through to index.html with 200 OK
  app.all('/api/*', (req, res) => {
    console.warn(`[Server] Unmatched API route: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: `Rota de API não encontrada: ${req.method} ${req.url}`,
      message: "Verifique se a URL da API está correta e se o servidor foi atualizado."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware initialized.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
