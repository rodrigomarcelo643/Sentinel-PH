import * as dotenv from 'dotenv';
import * as path from 'path';
import { auth, db } from "../config/firebase-admin";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testLogin() {
  const email = "admin@sentinelph.com";
  const password = "Admin123!@#";

  try {
    console.log("🔍 Testing admin user existence...");
    
    // Check if user exists in Auth
    try {
      const userRecord = await auth.getUserByEmail(email);
      console.log("✅ User found in Firebase Auth:");
      console.log("  Email:", userRecord.email);
      console.log("  UID:", userRecord.uid);
      console.log("  Display Name:", userRecord.displayName);
      console.log("  Email Verified:", userRecord.emailVerified);
      console.log("  Disabled:", userRecord.disabled);
      
      // Check custom claims
      const customClaims = userRecord.customClaims;
      console.log("  Custom Claims:", customClaims);
      
    } catch (error: any) {
      console.log("❌ User not found in Firebase Auth:", error.message);
      return;
    }

    console.log("\n🔍 Checking Firestore collections...");
    
    // Check admins collection
    try {
      const adminDoc = await db.collection("admins").doc(userRecord.uid).get();
      if (adminDoc.exists) {
        console.log("✅ User found in admins collection:");
        console.log("  Data:", adminDoc.data());
      } else {
        console.log("❌ User not found in admins collection");
      }
    } catch (error: any) {
      console.log("❌ Error accessing admins collection:", error.message);
    }

    // Check registrations collection
    try {
      const regSnapshot = await db.collection("registrations").where("uid", "==", userRecord.uid).get();
      if (!regSnapshot.empty) {
        console.log("✅ User found in registrations collection:");
        console.log("  Data:", regSnapshot.docs[0].data());
      } else {
        console.log("❌ User not found in registrations collection");
      }
    } catch (error: any) {
      console.log("❌ Error accessing registrations collection:", error.message);
    }

    console.log("\n🔧 Attempting to create custom auth token for testing...");
    
    // Create custom token for testing
    const customToken = await auth.createCustomToken(userRecord.uid, {
      role: "admin"
    });
    
    console.log("✅ Custom token created successfully (first 20 chars):", customToken.substring(0, 20) + "...");
    
    console.log("\n💡 Troubleshooting tips:");
    console.log("1. Make sure frontend and backend use same Firebase project");
    console.log("2. Check if email verification is required in Firebase Auth settings");
    console.log("3. Verify password is correct: Admin123!@#");
    console.log("4. Check Firebase Auth sign-in method settings (Email/Password should be enabled)");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  }
}

testLogin();
