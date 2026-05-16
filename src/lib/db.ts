export const INITIAL_CONTRACTORS = [];
export const INITIAL_SUPPLIERS = [];

export const DEMO_CONTRACTORS = [
  { id: 1, name: 'Apex Renovations', location: 'Kuala Lumpur', tags: ['Renovation', 'Interior Fit-Out', 'Carpentry', 'Flooring'], rating: 4.8, price: 'Premium' },
  { id: 2, name: 'Metro Builders', location: 'Petaling Jaya', tags: ['General Contracting', 'Flooring', 'Painting', 'Roofing'], rating: 4.6, price: 'Mid-Range' },
  { id: 3, name: 'Solid Fix Co.', location: 'Klang', tags: ['Roofing', 'Electrical', 'Plumbing'], rating: 4.2, price: 'Budget' },
];

export const DEMO_SUPPLIERS = [
  { id: 101, name: 'Lumber Co.', location: 'Selangor', coverage: 'Klang Valley', tags: ['Timber & Wood', 'Doors & Windows'], rating: 4.8, price: 'Mid-Range' },
  { id: 102, name: 'GlassTech Sdn Bhd', location: 'Kuala Lumpur', coverage: 'Nationwide', tags: ['Glass & Glazing', 'Hardware'], rating: 4.7, price: 'Premium' },
];

export const DEMO_HOMEOWNER_PROJECTS = [
  { id: 201, name: 'Tan Ah Kow', location: 'Petaling Jaya', servicesNeeded: ['Flooring', 'Roofing'], budget: 'RM30k–60k', timeline: 'ASAP' },
  { id: 202, name: 'Sarah Lee', location: 'Kuala Lumpur', servicesNeeded: ['Plumbing', 'Electrical'], budget: 'RM5k–15k', timeline: '1 month' },
  { id: 203, name: 'David Chen', location: 'Subang Jaya', servicesNeeded: ['Renovation', 'Interior Fit-Out'], budget: 'RM100k+', timeline: '3 months' },
];

export const getContractors = () => {
  const saved = localStorage.getItem('buildlink_contractors');
  return saved ? JSON.parse(saved) : DEMO_CONTRACTORS;
};

export const getSuppliers = () => {
  const saved = localStorage.getItem('buildlink_suppliers');
  return saved ? JSON.parse(saved) : DEMO_SUPPLIERS;
};

export const getHomeownerProjects = () => {
  const saved = localStorage.getItem('buildlink_homeowner_projects');
  return saved ? JSON.parse(saved) : DEMO_HOMEOWNER_PROJECTS;
};

export const populateDemoData = () => {
  localStorage.setItem('buildlink_contractors', JSON.stringify(DEMO_CONTRACTORS));
  localStorage.setItem('buildlink_suppliers', JSON.stringify(DEMO_SUPPLIERS));
  localStorage.setItem('buildlink_homeowner_projects', JSON.stringify(DEMO_HOMEOWNER_PROJECTS));
  return { contractors: DEMO_CONTRACTORS, suppliers: DEMO_SUPPLIERS, projects: DEMO_HOMEOWNER_PROJECTS };
};

export const clearData = () => {
  localStorage.removeItem('buildlink_contractors');
  localStorage.removeItem('buildlink_suppliers');
  localStorage.removeItem('buildlink_homeowner_projects');
};

