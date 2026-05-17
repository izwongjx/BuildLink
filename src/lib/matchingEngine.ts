// ─── Service ↔ Material mapping (single source of truth) ─────────────────────
export const SERVICE_MATERIAL_MAP: Record<string, { contractorServices: string[]; supplierMaterials: string[] }> = {
  Flooring:         { contractorServices: ['Flooring', 'General Contracting'],          supplierMaterials: ['Tiles & Stone', 'Timber & Wood', 'Hardware & Fasteners'] },
  Electrical:       { contractorServices: ['Electrical', 'General Contracting'],        supplierMaterials: ['Electrical Supplies', 'Hardware & Fasteners'] },
  Plumbing:         { contractorServices: ['Plumbing', 'General Contracting'],          supplierMaterials: ['Plumbing Supplies', 'Hardware & Fasteners'] },
  'Glass Works':    { contractorServices: ['Glass Works', 'General Contracting'],       supplierMaterials: ['Glass & Glazing', 'Doors & Windows'] },
  Carpentry:        { contractorServices: ['Carpentry', 'General Contracting'],         supplierMaterials: ['Timber & Wood', 'Furniture Components', 'Hardware & Fasteners'] },
  Painting:         { contractorServices: ['Painting', 'General Contracting'],          supplierMaterials: ['Paint & Coatings'] },
  Tiling:           { contractorServices: ['Tiling', 'General Contracting'],            supplierMaterials: ['Tiles & Stone', 'Cement & Concrete', 'Hardware & Fasteners'] },
  Roofing:          { contractorServices: ['Roofing', 'General Contracting'],           supplierMaterials: ['Roofing Materials', 'Steel & Metal', 'Hardware & Fasteners'] },
  'Steel Works':    { contractorServices: ['Steel Works', 'General Contracting'],       supplierMaterials: ['Steel & Metal', 'Hardware & Fasteners'] },
  'Interior Fit-Out': { contractorServices: ['Interior Fit-Out', 'General Contracting', 'Carpentry', 'Painting'], supplierMaterials: ['Timber & Wood', 'Paint & Coatings', 'Furniture Components', 'Hardware & Fasteners'] },
  Landscaping:      { contractorServices: ['Landscaping', 'General Contracting'],       supplierMaterials: ['Landscaping Supplies'] },
  'Doors & Windows': { contractorServices: ['Glass Works', 'Carpentry', 'General Contracting'], supplierMaterials: ['Doors & Windows', 'Glass & Glazing', 'Timber & Wood'] },
  'Custom Furniture': { contractorServices: ['Carpentry', 'Interior Fit-Out'],          supplierMaterials: ['Timber & Wood', 'Furniture Components', 'Hardware & Fasteners'] },
  Renovation:       { contractorServices: ['Renovation', 'General Contracting'],        supplierMaterials: ['Cement & Concrete', 'Paint & Coatings', 'Tiles & Stone', 'Hardware & Fasteners'] },
};

// ─── Budget ↔ priceRange compatibility ───────────────────────────────────────
const BUDGET_PRICE_MAP: Record<string, string[]> = {
  'Under RM5k':    ['Budget'],
  'RM5k–20k':      ['Budget', 'Mid-Range'],
  'RM5k-20k':      ['Budget', 'Mid-Range'],
  'RM20k–50k':     ['Mid-Range', 'Premium'],
  'RM20k-50k':     ['Mid-Range', 'Premium'],
  'RM30k–60k':     ['Mid-Range', 'Premium'],
  'RM50k–150k':    ['Premium', 'Negotiable'],
  'RM100k+':       ['Premium', 'Negotiable'],
  'RM150k+':       ['Premium', 'Negotiable'],
};

function budgetCompatible(budget: string, priceRange: string): boolean {
  const allowed = Object.entries(BUDGET_PRICE_MAP).find(([k]) =>
    budget?.toLowerCase().includes(k.toLowerCase().replace('rm', 'rm'))
    || k.toLowerCase() === budget?.toLowerCase()
  );
  if (!allowed) return false;
  return allowed[1].some(p => p.toLowerCase() === priceRange?.toLowerCase());
}

// ─── Score result type ────────────────────────────────────────────────────────
export interface ScoreResult {
  score: number;
  matchedOn: string[];
}

// ─── 1. Contractor ← Project (homeowner perspective) ─────────────────────────
export function scoreContractorForHomeowner(contractor: any, project: any): ScoreResult {
  const projectScopes: string[] = (project.scopeItems || []).map((s: any) => s.service);
  const contractorServices: string[] = contractor.tags || contractor.services || [];

  const matchedServices = contractorServices.filter(service =>
    projectScopes.some(scope => SERVICE_MATERIAL_MAP[scope]?.contractorServices.includes(service))
  );

  if (matchedServices.length === 0) return { score: 0, matchedOn: [] };

  let score = Math.min(50, (matchedServices.length / Math.max(projectScopes.length, 1)) * 50);

  // Location +20
  if (contractor.location && project.location &&
    contractor.location.toLowerCase().includes(project.location.toLowerCase()) ||
    project.location?.toLowerCase().includes(contractor.location?.toLowerCase())) score += 20;

  // Budget +15
  if (budgetCompatible(project.budget, contractor.price)) score += 15;

  // Availability +10/+5
  if (contractor.avail?.includes('Available Now')) score += 10;
  else if (contractor.avail?.includes('Open to New Projects')) score += 5;

  // Certs +3/+2
  if (contractor.certs?.includes('CIDB Registered')) score += 3;
  if (contractor.certs?.includes('Insured')) score += 2;

  return { score: Math.min(100, Math.round(score)), matchedOn: matchedServices };
}

// ─── 2. Supplier ← Project (homeowner perspective) ───────────────────────────
export function scoreSupplierForHomeowner(supplier: any, project: any): ScoreResult {
  const projectScopes: string[] = (project.scopeItems || []).map((s: any) => s.service);
  const supplierCats: string[] = supplier.tags || supplier.productCategories || [];

  const matchedCategories = supplierCats.filter(cat =>
    projectScopes.some(scope => SERVICE_MATERIAL_MAP[scope]?.supplierMaterials.includes(cat))
  );

  if (matchedCategories.length === 0) return { score: 0, matchedOn: [] };

  let score = Math.min(50, (matchedCategories.length / Math.max(projectScopes.length, 1)) * 50);

  // Location/delivery +20
  const deliveryStates: string[] = supplier.deliveryStates || (supplier.coverage ? supplier.coverage.split(',').map((s: string) => s.trim()) : [supplier.location]);
  if (project.location && deliveryStates.some(s => project.location.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(project.location.toLowerCase()))) score += 20;

  // MOQ +10/+5
  const moq = supplier.moq ?? 999;
  if (moq <= 10) score += 10;
  else if (moq <= 50) score += 5;

  // Lead time +10/+5
  const leadTime = supplier.leadTime ?? 999;
  if (leadTime <= 7) score += 10;
  else if (leadTime <= 14) score += 5;

  // Certs +5 each, max +10
  const certBonus = Math.min(10, (supplier.certs || []).filter((c: string) => ['SIRIM Approved', 'ISO Certified'].includes(c)).length * 5);
  score += certBonus;

  return { score: Math.min(100, Math.round(score)), matchedOn: matchedCategories };
}

// ─── 3. Project ← Contractor (contractor perspective) ────────────────────────
export function scoreHomeownerForContractor(project: any, contractor: any): ScoreResult {
  return scoreContractorForHomeowner(contractor, project);
}

// ─── 4. Project ← Supplier (supplier perspective) ────────────────────────────
export function scoreHomeownerForSupplier(project: any, supplier: any): ScoreResult {
  return scoreSupplierForHomeowner(supplier, project);
}

// ─── 5. Supplier ← Contractor (contractor needs materials) ───────────────────
export function scoreSupplierForContractor(supplier: any, contractor: any): ScoreResult {
  const contractorServices: string[] = contractor.tags || contractor.services || [];
  const supplierCats: string[] = supplier.tags || supplier.productCategories || [];

  const matchedCategories = supplierCats.filter(cat =>
    contractorServices.some(service =>
      Object.values(SERVICE_MATERIAL_MAP).some(mapping =>
        mapping.contractorServices.includes(service) && mapping.supplierMaterials.includes(cat)
      )
    )
  );

  if (matchedCategories.length === 0) return { score: 0, matchedOn: [] };

  let score = Math.min(55, (matchedCategories.length / Math.max(supplierCats.length, 1)) * 55);

  // Location +25
  if (contractor.location && supplier.location &&
    (contractor.location.toLowerCase().includes(supplier.location.toLowerCase()) ||
     supplier.location.toLowerCase().includes(contractor.location.toLowerCase()))) score += 25;

  // Availability +15/+5
  if (contractor.avail?.includes('Available Now')) score += 15;
  else if (contractor.avail?.includes('Open to New Projects')) score += 5;

  return { score: Math.min(100, Math.round(score)), matchedOn: matchedCategories };
}

// ─── 6. Contractor ← Supplier (supplier perspective) ─────────────────────────
export function scoreContractorForSupplier(contractor: any, supplier: any): ScoreResult {
  return scoreSupplierForContractor(supplier, contractor);
}

// ─── Sort helper: score > 0 first (desc), then score = 0 at bottom ───────────
export function sortByScore<T extends { score: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.score === 0 && b.score === 0) return 0;
    if (a.score === 0) return 1;
    if (b.score === 0) return -1;
    return b.score - a.score;
  });
}

// ─── Match badge style (Section 7 colour rules) ───────────────────────────────
export function matchBadgeStyle(score: number): { bg: string; text: string; label: string } {
  if (score === 0)   return { bg: '#888880', text: '#FFFFFF', label: '0% Match' };
  if (score < 50)    return { bg: '#FEF3C7', text: '#92400E', label: `${score}% Match` };
  if (score < 80)    return { bg: '#EEF2FF', text: '#1E46C4', label: `${score}% Match` };
  if (score < 100)   return { bg: '#E8642A', text: '#FFFFFF', label: `${score}% Match` };
  return               { bg: '#E8642A', text: '#FFFFFF', label: '100% MATCH' };
}
