import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { registrationAuth, db } from "@/lib/firebase";
import {
  addMockCredential,
  updateMockCredential,
  updateMockCredentialPassword,
  removeMockCredentialByAccountId,
  type MockCredential,
} from "@/data/mockUsers";
import type { User } from "@/@types/contexts/auth";

export interface ManagedAccountProfile {
  uid?: string;
  email: string;
  displayName?: string;
  fullName?: string;
  role: string;
  accountType?: string;
  region?: string;
  municipality?: string;
  officeName?: string;
  headOfficer?: string;
  officialEmail?: string;
  phone?: string;
  address?: string;
  subscription?: string;
  status?: string;
}

export interface CreateManagedAccountInput {
  accountId: string;
  email: string;
  username: string;
  password: string;
  profile: ManagedAccountProfile;
  registrationData?: Record<string, unknown>;
}

export async function createManagedAccount(
  isMock: boolean,
  input: CreateManagedAccountInput
): Promise<string | void> {
  if (isMock) {
    const uid = `mock-${input.profile.role}-${input.accountId}`;
    addMockCredential({
      accountId: input.accountId,
      email: input.email.trim(),
      username: input.username.trim(),
      password: input.password,
      profile: {
        uid,
        email: input.email.trim(),
        displayName: input.profile.displayName || input.profile.fullName,
        fullName: input.profile.fullName,
        role: input.profile.role,
        accountType: input.profile.accountType || input.profile.role,
        region: input.profile.region,
        municipality: input.profile.municipality,
        officeName: input.profile.officeName,
        headOfficer: input.profile.headOfficer,
        officialEmail: input.profile.officialEmail,
        phone: input.profile.phone,
        address: input.profile.address,
        subscription: input.profile.subscription,
        status: input.profile.status || "approved",
      },
    });
    return uid;
  }

  const userCredential = await createUserWithEmailAndPassword(
    registrationAuth,
    input.email.trim(),
    input.password
  );
  await signOut(registrationAuth);

  await addDoc(collection(db, "registrations"), {
    ...input.registrationData,
    uid: userCredential.user.uid,
    email: input.email.trim(),
    username: input.username.trim(),
    role: input.profile.role,
    accountType: input.profile.accountType || input.profile.role,
    status: input.profile.status || "approved",
    createdAt: serverTimestamp(),
  });

  return userCredential.user.uid;
}

export async function updateManagedAccountCredentials(
  isMock: boolean,
  accountId: string,
  updates: {
    email?: string;
    username?: string;
    password?: string;
    profile?: Partial<User>;
  }
) {
  if (isMock) {
    updateMockCredential(accountId, updates);
    return;
  }

  if (updates.password) {
    throw new Error(
      "Live password updates require Firebase Admin. Ask the user to reset via email."
    );
  }
}

export async function changeManagedAccountPassword(
  isMock: boolean,
  accountId: string,
  newPassword: string
) {
  if (isMock) {
    updateMockCredentialPassword(accountId, newPassword);
    return;
  }
  throw new Error(
    "Live password updates require Firebase Admin. Ask the user to reset via email."
  );
}

export function deleteManagedAccountCredentials(isMock: boolean, accountId: string) {
  if (isMock) {
    removeMockCredentialByAccountId(accountId);
  }
}

export function buildBhwCredentialProfile(
  bhw: Record<string, unknown>,
  regionFilter: string
): ManagedAccountProfile {
  return {
    displayName: bhw.fullName as string,
    fullName: bhw.fullName as string,
    role: "bhw",
    accountType: "bhw",
    region: regionFilter,
    municipality: bhw.municipality as string,
    officeName: bhw.officeName as string,
    headOfficer: bhw.headOfficer as string,
    phone: bhw.phone as string,
    address: bhw.address as string,
    subscription: (bhw.subscription as string) || "barangay",
    status: mapBhwLoginStatus(bhw.status as string),
    email: bhw.email as string,
  };
}

export function mapBhwLoginStatus(status?: string): string {
  if (status === "inactive") return "inactive";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  return "approved";
}

export function buildMunicipalCredentialProfile(
  municipality: Record<string, unknown>,
  regionFilter: string
): ManagedAccountProfile {
  return {
    displayName: municipality.headOfficer as string,
    fullName: municipality.headOfficer as string,
    role: "municipal_admin",
    accountType: "municipal_admin",
    region: regionFilter,
    municipality: municipality.name as string,
    officeName: `${municipality.name as string} MHO`,
    headOfficer: municipality.headOfficer as string,
    officialEmail: municipality.officialEmail as string,
    phone: municipality.phone as string,
    address: municipality.address as string,
    status: municipality.status === "active" ? "approved" : "inactive",
    email: municipality.officialEmail as string,
  };
}

export type { MockCredential };
