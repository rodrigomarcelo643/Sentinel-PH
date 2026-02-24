import * as dotenv from 'dotenv';
import * as path from 'path';
import { db, auth } from "../config/firebase-admin";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function addAdmin() {
  const adminData = {
    username: "testadmin",
    fullName: "Test Admin",
    email: "admin@sentinelph.com",
    contactNumber: "+639123456789",
    address: "Manila, Philippines", 
    password: "Admin123!@#",
  };

  try {
    // Create auth user with admin role
    const userRecord = await auth.createUser({
      email: adminData.email,
      password: adminData.password,
      displayName: adminData.fullName,
    });

    // Set custom claims for admin role
    await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });

    // Add to Firestore
    await db.collection("admins").doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: adminData.username,
      fullName: adminData.fullName,
      email: adminData.email,
      contactNumber: adminData.contactNumber,
      address: adminData.address,
      role: "admin",
      status: "approved",
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Admin created successfully!");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
    console.log("UID:", userRecord.uid);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addAdmin();
