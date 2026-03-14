
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

async function updateStripeKeys() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  
  const db = admin.firestore();
  
  const publicKey = "pk_live_51RXxToAzbUVU35SS3NPa5nDspCqjSon0vWQ6OMs0yRC0LZx0VuS99BiKCleNAZnqS9lr3LJUWI2BbeJdVT0CNgSt00LenAPkI8";
  const secretKey = "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";

  console.log("Updating Stripe keys in Firestore (config/payment)...");
  
  await db.collection('config').doc('payment').set({
    settings: {
      publicKey: publicKey,
      secretKey: secretKey,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }, { merge: true });

  console.log("Stripe keys updated successfully.");

  // Also check if 'tags' document exists for frontend PK
  console.log("Updating Public Key in config/tags for frontend...");
  await db.collection('config').doc('tags').set({
    settings: {
      stripePublicKey: publicKey,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }, { merge: true });
  
  console.log("Public key updated in config/tags.");
}

updateStripeKeys().catch(console.error);
