/** Seed data for DOH Region VII mock demo when Firestore is empty */

export const SEED_MUNICIPALITIES = [
  {
    id: "seed-cebu-city",
    name: "Cebu City",
    region: "Region VII",
    username: "mho_cebu_city",
    headOfficer: "Dr. Maria Santos",
    officialEmail: "mho.cebu@health.gov.ph",
    phone: "+63 32 411 0001",
    address: "Cebu City Hall, Cebu City",
    status: "active",
    bhws: 24,
    sentinels: 0,
  },
  {
    id: "seed-lapu-lapu",
    name: "Lapu-Lapu City",
    region: "Region VII",
    username: "mho_lapu_lapu",
    headOfficer: "Dr. Juan Dela Cruz",
    officialEmail: "mho.lapulapu@health.gov.ph",
    phone: "+63 32 340 0002",
    address: "Lapu-Lapu City Hall, Mactan",
    status: "active",
    bhws: 18,
    sentinels: 0,
  },
  {
    id: "seed-mandaue",
    name: "Mandaue City",
    region: "Region VII",
    username: "mho_mandaue",
    headOfficer: "Dr. Ana Reyes",
    officialEmail: "mho.mandaue@health.gov.ph",
    phone: "+63 32 344 0003",
    address: "Mandaue City Hall, Mandaue",
    status: "active",
    bhws: 15,
    sentinels: 0,
  },
  {
    id: "seed-dalaguete",
    name: "Dalaguete",
    region: "Region VII",
    username: "mho_dalaguete",
    headOfficer: "Dr. Pedro Garcia",
    officialEmail: "mho.dalaguete@health.gov.ph",
    phone: "+63 32 480 0004",
    address: "Dalaguete Municipal Hall, Cebu",
    status: "active",
    bhws: 8,
    sentinels: 0,
  },
];

export const SEED_BHWS = [
  {
    id: "seed-bhw-1",
    fullName: "Maria Clara Santos",
    email: "bhw.maria@healthwatch.ph",
    phone: "+63 917 123 4567",
    municipality: "Cebu City",
    barangay: "Lahug",
    region: "Region VII",
    officeName: "Lahug Barangay Health Center",
    headOfficer: "Maria Clara Santos",
    address: "Lahug, Cebu City, Cebu",
    role: "bhw",
    status: "approved",
    username: "bhw_maria",
    subscription: "barangay",
    accountType: "bhw",
    assignedRegion: "Region VII",
    sentinels: 3,
  },
  {
    id: "seed-bhw-2",
    fullName: "Jose Rizal Mendoza",
    email: "bhw.jose@healthwatch.ph",
    phone: "+63 918 234 5678",
    municipality: "Lapu-Lapu City",
    barangay: "Pusok",
    region: "Region VII",
    officeName: "Pusok Barangay Health Center",
    headOfficer: "Jose Rizal Mendoza",
    address: "Pusok, Lapu-Lapu City, Cebu",
    role: "bhw",
    status: "approved",
    username: "bhw_jose",
    subscription: "barangay",
    accountType: "bhw",
    assignedRegion: "Region VII",
    sentinels: 2,
  },
  {
    id: "seed-bhw-3",
    fullName: "Ana Patricia Lopez",
    email: "bhw.ana@healthwatch.ph",
    phone: "+63 919 345 6789",
    municipality: "Mandaue City",
    barangay: "Banilad",
    region: "Region VII",
    officeName: "Banilad Barangay Health Center",
    headOfficer: "Ana Patricia Lopez",
    address: "Banilad, Mandaue City, Cebu",
    role: "bhw",
    status: "pending",
    username: "bhw_ana",
    subscription: "barangay",
    accountType: "bhw",
    assignedRegion: "Region VII",
    sentinels: 0,
  },
  {
    id: "seed-bhw-4",
    fullName: "Pedro Aguilar",
    email: "bhw.pedro@healthwatch.ph",
    phone: "+63 920 456 7890",
    municipality: "Dalaguete",
    barangay: "Poblacion",
    region: "Region VII",
    officeName: "Poblacion Barangay Health Center",
    headOfficer: "Pedro Aguilar",
    address: "Poblacion, Dalaguete, Cebu",
    role: "bhw",
    status: "pending",
    username: "bhw_pedro",
    subscription: "barangay",
    accountType: "bhw",
    assignedRegion: "Region VII",
    sentinels: 0,
  },
];

const MUNICIPALITIES_KEY = "doh_r7_municipalities";
const BHWS_KEY = "doh_r7_bhws";

export function loadMockMunicipalities(): typeof SEED_MUNICIPALITIES {
  try {
    const stored = localStorage.getItem(MUNICIPALITIES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* use seed */
  }
  localStorage.setItem(MUNICIPALITIES_KEY, JSON.stringify(SEED_MUNICIPALITIES));
  return [...SEED_MUNICIPALITIES];
}

export function saveMockMunicipalities(data: typeof SEED_MUNICIPALITIES) {
  localStorage.setItem(MUNICIPALITIES_KEY, JSON.stringify(data));
}

export function loadMockBHWs(): typeof SEED_BHWS {
  try {
    const stored = localStorage.getItem(BHWS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* use seed */
  }
  localStorage.setItem(BHWS_KEY, JSON.stringify(SEED_BHWS));
  return [...SEED_BHWS];
}

export function saveMockBHWs(data: typeof SEED_BHWS) {
  localStorage.setItem(BHWS_KEY, JSON.stringify(data));
}
