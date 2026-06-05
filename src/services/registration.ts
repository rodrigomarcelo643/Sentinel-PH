import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth, registrationAuth } from '@/lib/firebase';

const USER_STORAGE_KEY = 'healthwatch_user';

/** Ensure the main app has no active session after registration */
const clearMainAppSession = async () => {
  try {
    await signOut(auth);
  } catch {
    // Already signed out
  }
  localStorage.removeItem(USER_STORAGE_KEY);
};
import { uploadImage } from '@/services/cloudinaryService';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  middleInitial: string;
  contactNumber: string;
  email: string;
  region: string;
  municipality: string;
  barangay: string;
  communityRole: string;
  idType: string;
  validIdFile: File;
  selfieFile: File;
  password: string;
}

export const checkContactNumberExists = async (contactNumber: string): Promise<boolean> => {
  const formattedPhone = `0${contactNumber}`;
  const q = query(collection(db, 'users'), where('contactNumber', '==', formattedPhone));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const registerUser = async (data: RegistrationData) => {
  let authUserCreated = false;

  try {
    const exists = await checkContactNumberExists(data.contactNumber);
    if (exists) throw new Error('Contact number already registered');

    const [validIdUrl, selfieUrl] = await Promise.all([
      uploadImage(data.validIdFile),
      uploadImage(data.selfieFile),
    ]);

    // Use isolated Auth so onAuthStateChanged on the main app never fires
    const userCredential = await createUserWithEmailAndPassword(
      registrationAuth,
      data.email,
      data.password
    );
    authUserCreated = true;

    const formattedPhone = `0${data.contactNumber}`;

    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      middleInitial: data.middleInitial,
      contactNumber: formattedPhone,
      email: data.email,
      address: {
        region: data.region,
        municipality: data.municipality,
        barangay: data.barangay,
      },
      communityRole: data.communityRole,
      documents: {
        idType: data.idType,
        validIdUrl,
        selfieUrl,
      },
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    await signOut(registrationAuth);
    await clearMainAppSession();

    return userCredential.user;
  } catch (error: unknown) {
    if (authUserCreated) {
      await signOut(registrationAuth).catch(() => undefined);
      await clearMainAppSession();
    }

    const err = error as { code?: string; message?: string };
    if (err.code === 'unavailable' || err.message?.includes('backend')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};
