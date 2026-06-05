import type { User } from "@/@types/contexts/auth";
import { SEED_BHWS, SEED_MUNICIPALITIES } from "@/data/dohRegionViiSeedData";

export const MOCK_USER_FLAG = "healthwatch_mock_user";
const DYNAMIC_CREDENTIALS_KEY = "healthwatch_mock_credentials";

export interface MockCredential {
  accountId: string;
  email: string;
  username: string;
  password: string;
  profile: User;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  {
    accountId: "mock-doh-region7-uid",
    email: "dohregion7@gmail.com",
    username: "dohregion7",
    password: "doh123",
    profile: {
      uid: "mock-doh-region7-uid",
      email: "dohregion7@gmail.com",
      displayName: "DOH Region VII Admin",
      fullName: "DOH Region VII Admin",
      role: "doh_region_vii",
      accountType: "doh_region_vii",
      region: "Region VII",
      officeName: "Department of Health - Region VII (Central Visayas)",
      headOfficer: "Regional Director",
      officialEmail: "dohregion7@gmail.com",
      phone: "+63 32 123 4567",
      address: "Cebu City, Central Visayas",
      municipality: "Cebu City",
      status: "approved",
    },
  },
];

const DEFAULT_BHW_PASSWORD = "Bhw12345";
const DEFAULT_MHO_PASSWORD = "Mho12345";

function buildSeedCredentials(): MockCredential[] {
  const bhwCredentials: MockCredential[] = SEED_BHWS.map((bhw) => ({
    accountId: bhw.id,
    email: bhw.email,
    username: bhw.username,
    password: DEFAULT_BHW_PASSWORD,
    profile: {
      uid: `mock-bhw-${bhw.id}`,
      email: bhw.email,
      displayName: bhw.fullName,
      fullName: bhw.fullName,
      role: "bhw",
      accountType: "bhw",
      region: bhw.region,
      municipality: bhw.municipality,
      officeName: bhw.officeName,
      headOfficer: bhw.headOfficer,
      phone: bhw.phone,
      address: bhw.address,
      subscription: bhw.subscription,
      status: bhw.status,
    },
  }));

  const municipalityCredentials: MockCredential[] = SEED_MUNICIPALITIES.map((muni) => ({
    accountId: muni.id,
    email: muni.officialEmail,
    username: muni.username,
    password: DEFAULT_MHO_PASSWORD,
    profile: {
      uid: `mock-municipal-${muni.id}`,
      email: muni.officialEmail,
      displayName: muni.headOfficer,
      fullName: muni.headOfficer,
      role: "municipal_admin",
      accountType: "municipal_admin",
      region: muni.region,
      municipality: muni.name,
      officeName: `${muni.name} MHO`,
      headOfficer: muni.headOfficer,
      officialEmail: muni.officialEmail,
      phone: muni.phone,
      address: muni.address,
      status: muni.status === "active" ? "approved" : "inactive",
    },
  }));

  return [...bhwCredentials, ...municipalityCredentials];
}

export function loadDynamicMockCredentials(): MockCredential[] {
  try {
    const stored = localStorage.getItem(DYNAMIC_CREDENTIALS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* use seed */
  }
  const seeded = buildSeedCredentials();
  localStorage.setItem(DYNAMIC_CREDENTIALS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveDynamicMockCredentials(credentials: MockCredential[]) {
  localStorage.setItem(DYNAMIC_CREDENTIALS_KEY, JSON.stringify(credentials));
}

function getAllMockCredentials(): MockCredential[] {
  return [...MOCK_CREDENTIALS, ...loadDynamicMockCredentials()];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function findMockCredentialByIdentifier(identifier: string): MockCredential | null {
  const normalized = normalize(identifier);
  return (
    getAllMockCredentials().find(
      (c) =>
        normalize(c.email) === normalized || normalize(c.username) === normalized
    ) ?? null
  );
}

export function getMockUserByCredentials(
  identifier: string,
  password: string
): User | null {
  const normalized = normalize(identifier);
  const match = getAllMockCredentials().find(
    (c) =>
      c.password === password &&
      (normalize(c.email) === normalized || normalize(c.username) === normalized)
  );
  return match ? { ...match.profile } : null;
}

export function isMockUser(user: User | null): boolean {
  return !!user?.uid?.startsWith("mock-");
}

export function isCredentialTaken(email: string, username: string, excludeAccountId?: string) {
  const normalizedEmail = normalize(email);
  const normalizedUsername = normalize(username);
  return getAllMockCredentials().some(
    (c) =>
      c.accountId !== excludeAccountId &&
      (normalize(c.email) === normalizedEmail || normalize(c.username) === normalizedUsername)
  );
}

export function addMockCredential(credential: MockCredential) {
  const current = loadDynamicMockCredentials();
  if (isCredentialTaken(credential.email, credential.username)) {
    throw new Error("Email or username is already in use");
  }
  saveDynamicMockCredentials([...current, credential]);
}

export function updateMockCredential(
  accountId: string,
  updates: Partial<Pick<MockCredential, "email" | "username" | "password" | "profile">>
) {
  const current = loadDynamicMockCredentials();
  const index = current.findIndex((c) => c.accountId === accountId);
  if (index === -1) {
    throw new Error("Account credentials not found");
  }

  const nextEmail = updates.email ?? current[index].email;
  const nextUsername = updates.username ?? current[index].username;
  if (
    isCredentialTaken(nextEmail, nextUsername, accountId)
  ) {
    throw new Error("Email or username is already in use");
  }

  current[index] = {
    ...current[index],
    ...updates,
    profile: updates.profile
      ? { ...current[index].profile, ...updates.profile }
      : current[index].profile,
  };
  saveDynamicMockCredentials(current);
}

export function updateMockCredentialPassword(accountId: string, password: string) {
  updateMockCredential(accountId, { password });
}

export function removeMockCredentialByAccountId(accountId: string) {
  const current = loadDynamicMockCredentials();
  saveDynamicMockCredentials(current.filter((c) => c.accountId !== accountId));
}

export function getMockCredentialByAccountId(accountId: string): MockCredential | null {
  return getAllMockCredentials().find((c) => c.accountId === accountId) ?? null;
}
