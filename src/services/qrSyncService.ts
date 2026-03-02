import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export const syncUserQRCode = async (userId: string) => {
  try {
    const qrQuery = query(collection(db, 'userQRCodes'), where('userId', '==', userId));
    const qrSnapshot = await getDocs(qrQuery);

    if (qrSnapshot.empty) return;

    const qrDoc = qrSnapshot.docs[0];
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) return;

    const userData = userSnapshot.docs[0].data();
    
    try {
      const reportsQuery = query(
        collection(db, 'symptomReports'),
        where('userId', '==', userId)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const symptomReports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      await updateDoc(doc(db, 'userQRCodes', qrDoc.id), {
        userData: { ...userData, uid: userId },
        symptomReports,
        updatedAt: serverTimestamp()
      });
    } catch (reportErr) {
      console.log('Using existing symptom reports due to index error');
    }
  } catch (error) {
    console.error('Error syncing QR code:', error);
  }
};
