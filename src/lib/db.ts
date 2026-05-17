export const INITIAL_CONTRACTORS = [];
export const INITIAL_SUPPLIERS = [];

export const DEMO_CONTRACTORS = [
  {
    id: 1, name: 'Apex Renovations', location: 'Kuala Lumpur',
    tags: ['Renovation', 'Interior Fit-Out', 'Carpentry', 'Flooring', 'Smart Home Integration'],
    rating: 4.8, reviews: 42, projects: 124, years: 12,
    price: 'Premium', avail: 'Available Now', match: 94,
    role: 'Contractor', coverage: 'Kuala Lumpur, Selangor',
    about: 'Apex Renovations specialises in high-end residential and commercial fit-outs. With over a decade of experience, we pride ourselves on meticulous attention to detail, transparent pricing, and delivering projects on time.',
    certs: ['CIDB Registered', 'ISO Certified', 'Insured'],
    gallery: [
      { id: 1, title: 'Modern Kitchen', url: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=1000' },
      { id: 2, title: 'Luxury Bathroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000' },
      { id: 3, title: 'Living Space', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000' },
    ],
  },
  {
    id: 2, name: 'Metro Builders', location: 'Petaling Jaya',
    tags: ['General Contracting', 'Flooring', 'Painting', 'Roofing'],
    rating: 4.6, reviews: 28, projects: 87, years: 8,
    price: 'Mid-Range', avail: 'Available Now', match: 85,
    role: 'Contractor', coverage: 'Petaling Jaya, Subang Jaya, Shah Alam',
    about: 'Metro Builders delivers reliable mid-range construction and renovation services across the Klang Valley. Quality craftsmanship at fair prices.',
    certs: ['CIDB Registered', 'Insured'],
    gallery: [
      { id: 1, title: 'Roofing Project', url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1000' },
      { id: 2, title: 'Floor Finish', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000' },
    ],
  },
  {
    id: 3, name: 'Solid Fix Co.', location: 'Klang',
    tags: ['Roofing', 'Electrical', 'Plumbing'],
    rating: 4.2, reviews: 15, projects: 54, years: 5,
    price: 'Budget', avail: 'Open to New Projects', match: 78,
    role: 'Contractor', coverage: 'Klang, Port Klang',
    about: 'Solid Fix Co. specialises in essential home repair and maintenance services including roofing, electrical, and plumbing at budget-friendly rates.',
    certs: ['CIDB Registered'],
    gallery: [
      { id: 1, title: 'Electrical Work', url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=1000' },
    ],
  },
];

export const DEMO_SUPPLIERS = [
  {
    id: 101, name: 'Lumber Co.', location: 'Selangor',
    coverage: 'Klang Valley, Penang, Johor',
    tags: ['Timber & Wood', 'Flooring', 'Doors & Windows', 'Plywood', 'MDF'],
    rating: 4.8, reviews: 128, projects: 500, years: 20,
    price: 'Wholesale', avail: 'In Stock', match: 92,
    role: 'Supplier',
    about: 'Lumber Co. is a premier supplier of high-quality timber, engineered wood, and custom joinery materials. Sourcing sustainably, we provide contractors and builders with reliable, top-grade materials.',
    certs: ['ISO Certified', 'SIRIM Approved', 'Sustainable Forestry'],
    products: ['Premium Teak Wood', 'Oak Laminate Flooring', 'Solid Wood Doors', 'Plywood Sheets', 'MDF Boards'],
    gallery: [
      { id: 1, title: 'Premium Oak', url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=1000' },
      { id: 2, title: 'Engineered Pine', url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=1000' },
    ],
  },
  {
    id: 102, name: 'GlassTech Sdn Bhd', location: 'Kuala Lumpur',
    coverage: 'Nationwide',
    tags: ['Glass & Glazing', 'Hardware', 'Aluminium Frames', 'Mirror Works'],
    rating: 4.7, reviews: 89, projects: 320, years: 15,
    price: 'Premium', avail: 'In Stock', match: 88,
    role: 'Supplier',
    about: 'GlassTech is Malaysia\'s leading glass and glazing solutions provider. We supply premium glass panels, aluminium framing systems, and hardware to contractors nationwide.',
    certs: ['ISO Certified', 'SIRIM Approved'],
    products: ['Tempered Glass Panels', 'Aluminium Framing', 'Mirror Sheets', 'Sliding Door Hardware'],
    gallery: [
      { id: 1, title: 'Glass Installation', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000' },
      { id: 2, title: 'Glazing Works', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000' },
    ],
  },
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
export const getProvider = (type: string, id: string | number) => {
  const list = type === 'contractor' ? getContractors() : getSuppliers();
  return list.find((p: any) => String(p.id) === String(id));
};
