import { uuid } from './projects';

// ─── Types ────────────────────────────────────────────────────────────────────
export type InvitationStatus = 'pending' | 'accepted' | 'declined';
export type InvitationFromType = 'contractor' | 'supplier';

export interface Invitation {
  id: string;
  fromType: InvitationFromType;
  fromId: string;
  fromName: string;
  toHomeownerId: string | null;
  toSupplierId: string | null;
  toContractorId: string | null;
  projectId: string | null;
  scopesOffered: string[] | null;
  materialsOffered: string[] | null;
  materialsNeeded: string[] | null;
  sentAt: number;
  status: InvitationStatus;
  message: string | null;
}

const KEY = 'buildlink_invitations';

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export const getInvitations = (): Invitation[] => {
  const saved = localStorage.getItem(KEY);
  if (saved) return JSON.parse(saved);
  return seedInvitations();
};

export const saveInvitations = (invitations: Invitation[]) => {
  localStorage.setItem(KEY, JSON.stringify(invitations));
};

export const addInvitation = (inv: Omit<Invitation, 'id' | 'sentAt' | 'status'>): Invitation => {
  const invitations = getInvitations();
  const newInv: Invitation = { ...inv, id: uuid(), sentAt: Date.now(), status: 'pending' };
  saveInvitations([newInv, ...invitations]);
  return newInv;
};

export const updateInvitationStatus = (id: string, status: InvitationStatus) => {
  const invitations = getInvitations().map(i => i.id === id ? { ...i, status } : i);
  saveInvitations(invitations);
};

export const getInvitationsForHomeowner = (homeownerId: string) =>
  getInvitations().filter(i => i.toHomeownerId === homeownerId);

export const getInvitationsForContractor = (contractorId: string) =>
  getInvitations().filter(i => i.toContractorId === String(contractorId));

export const getInvitationsForSupplier = (supplierId: string) =>
  getInvitations().filter(i => i.toSupplierId === String(supplierId));

// ─── Seed (runs once when key is absent) ─────────────────────────────────────
function seedInvitations(): Invitation[] {
  const now = Date.now();
  const seed: Invitation[] = [
    // Contractor → Homeowner
    {
      id: uuid(),
      fromType: 'contractor',
      fromId: '1',
      fromName: 'Apex Renovations',
      toHomeownerId: 'demo-homeowner',
      toSupplierId: null,
      toContractorId: null,
      projectId: null,
      scopesOffered: ['Interior Fit-Out', 'Carpentry', 'Flooring'],
      materialsOffered: null,
      materialsNeeded: null,
      sentAt: now - 3600_000,
      status: 'pending',
      message: 'We can handle the full fit-out scope for your project.',
    },
    // Supplier → Homeowner
    {
      id: uuid(),
      fromType: 'supplier',
      fromId: '101',
      fromName: 'Lumber Co.',
      toHomeownerId: 'demo-homeowner',
      toSupplierId: null,
      toContractorId: null,
      projectId: null,
      scopesOffered: null,
      materialsOffered: ['Timber & Wood', 'Doors & Windows'],
      materialsNeeded: null,
      sentAt: now - 7200_000,
      status: 'pending',
      message: 'We can supply premium timber and doors for your renovation.',
    },
    // Contractor → Supplier
    {
      id: uuid(),
      fromType: 'contractor',
      fromId: '2',
      fromName: 'Metro Builders',
      toHomeownerId: null,
      toSupplierId: '101',
      toContractorId: null,
      projectId: null,
      scopesOffered: null,
      materialsOffered: null,
      materialsNeeded: ['Timber & Wood', 'Hardware & Fasteners'],
      sentAt: now - 1800_000,
      status: 'pending',
      message: 'Looking for timber and fasteners for an upcoming flooring job.',
    },
  ];
  saveInvitations(seed);
  return seed;
}
