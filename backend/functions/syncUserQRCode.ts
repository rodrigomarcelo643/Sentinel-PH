import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Sync QR code when user data is updated
export const syncQROnUserUpdate = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const userData = change.after.exists ? change.after.data() : null;

    if (!userData) return;

    try {
      const qrSnapshot = await db.collection('userQRCodes')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (qrSnapshot.empty) return;

      const qrDoc = qrSnapshot.docs[0];
      
      const reportsSnapshot = await db.collection('symptomReports')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const symptomReports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      await qrDoc.ref.update({
        userData: { ...userData, uid: userId },
        symptomReports,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`QR synced for user ${userId}`);
    } catch (error) {
      console.error(`Error syncing QR for user ${userId}:`, error);
    }
  });

// Sync QR code when symptom report is created/updated
export const syncQROnReportUpdate = functions.firestore
  .document('symptomReports/{reportId}')
  .onWrite(async (change, context) => {
    const reportData = change.after.exists ? change.after.data() : change.before.data();
    
    if (!reportData?.userId) return;

    const userId = reportData.userId;

    try {
      const qrSnapshot = await db.collection('userQRCodes')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (qrSnapshot.empty) return;

      const qrDoc = qrSnapshot.docs[0];
      
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : qrDoc.data().userData;

      const reportsSnapshot = await db.collection('symptomReports')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const symptomReports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      await qrDoc.ref.update({
        userData: { ...userData, uid: userId },
        symptomReports,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`QR synced for user ${userId} after report update`);
    } catch (error) {
      console.error(`Error syncing QR for user ${userId}:`, error);
    }
  });
