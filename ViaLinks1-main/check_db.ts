
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

async function checkFirestore() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
  
  const db = admin.firestore();
  
  console.log("Checking config collection...");
  const configDocs = await db.collection('config').get();
  configDocs.forEach(doc => {
    console.log(`Document: ${doc.id}, Data:`, JSON.stringify(doc.data(), null, 2));
  });

  console.log("\nChecking plans collection...");
  try {
    const plansDocs = await db.collection('plans').get();
    console.log(`Plans count: ${plansDocs.size}`);
    plansDocs.forEach(doc => {
      console.log(`Plan: ${doc.id}, Data:`, JSON.stringify(doc.data(), null, 2));
    });
  } catch (err) {
    console.error("Error checking plans:", err);
  }
}

checkFirestore().catch(console.error);
