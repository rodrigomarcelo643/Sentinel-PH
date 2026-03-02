import { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { syncUserQRCode } from '@/services/qrSyncService';

export const useQRSync = () => {
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'symptomReports'), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          if (data.userId) {
            await syncUserQRCode(data.userId);
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);
};