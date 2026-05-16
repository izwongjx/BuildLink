import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const CATEGORIES = ['Glass & Glazing', 'Timber & Wood', 'Steel & Metal', 'Tiles & Stone', 'Paint & Coatings', 'Cement & Concrete', 'Electrical Supplies', 'Plumbing Supplies', 'Hardware & Fasteners', 'Doors & Windows', 'Insulation', 'Roofing Materials', 'Furniture Components', 'Landscaping Supplies', 'Other'];
const CERTS = ['ISO Certified', 'SIRIM Approved', 'Halal Certified', 'Local Manufacturer', 'Importer'];

export default function SupplierOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [products, setProducts] = useState([{ id: 1, name: '', cat: '', price: '', unit: '', image: '' }]);
  const [about, setAbout] = useState('');

  const slideVars = {
    initial: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.3 } })
  };

  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const newSupplier = {
        id: Date.now(),
        name: businessName || 'New Supplier',
        location: location || 'Malaysia',
        tags: selectedCats,
        rating: 5.0,
        price: 'Mid-Range',
        about: about || "Leading supplier of premium building materials and hardware.",
        portfolio: products.filter(p => p.image).map((p, i) => ({ id: i, title: p.name || `Product ${i+1}`, url: p.image })) || [
          { id: 1, title: 'Premium Material', url: '/timber_supplier_warehouse.png' }
        ],
        certs: selectedCerts.length > 0 ? selectedCerts : ['Quality Guaranteed'],
        role: 'Supplier'
      };

      // 1. Add to global list for homeowners/contractors to see
      const existing = localStorage.getItem('buildlink_suppliers');
      const suppliers = existing ? JSON.parse(existing) : [];
      localStorage.setItem('buildlink_suppliers', JSON.stringify([...suppliers, newSupplier]));

      // 2. Save individual session data for matching
      localStorage.setItem('buildlink_supplier_data', JSON.stringify(newSupplier));
      localStorage.setItem('buildlink_onboarded_supplier', 'true');
      
      navigate('/dashboard/supplier');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayItem = (item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
        <div className="font-semibold text-[#111]">BuildLink</div>
        <div className="text-sm font-medium text-text-muted">Step {step} of {totalSteps}</div>
        <div className="w-10"></div>
      </div>

      <div className="h-1 w-full bg-border">
        <motion.div 
          className="h-full bg-accent"
          initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={1}>
            {step === 1 && (
              <motion.div key="s1" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Business Info</h1>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name</label>
                    <Input 
                      placeholder="Metro Hardware Supply" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Years Operating</label>
                      <Input placeholder="e.g. 15" type="number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">HQ Location</label>
                      <Input 
                        placeholder="State / City" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Coverage</label>
                    <Input placeholder="e.g. Klang Valley, Penang" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Product Categories</h1>
                <div className="flex flex-wrap gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleArrayItem(cat, setSelectedCats)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        selectedCats.includes(cat) ? 'bg-accent text-white border-accent' : 'bg-surface border-border hover:border-accent-light hover:bg-accent-light/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Product Listings</h1>
                <p className="text-text-muted mb-6">Add a few key products and images to get matched with contractors.</p>
                <div className="flex flex-col gap-6">
                  {products.map((p, idx) => (
                    <Card key={p.id} className="p-4 flex flex-col gap-4 bg-surface border-border border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm text-text-muted uppercase tracking-wider">Product {idx + 1}</span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-6">
                        <button 
                          onClick={() => {
                            const demo = ['/timber_supplier_warehouse.png', '/modern_kitchen_renovation.png'];
                            const next = demo[idx % demo.length];
                            setProducts(prev => prev.map((pr, i) => i === idx ? { ...pr, image: next } : pr));
                          }}
                          className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-background hover:bg-accent-light/10 transition-colors shrink-0 overflow-hidden"
                        >
                          {p.image ? (
                            <img src={p.image} className="w-full h-full object-cover" alt="Product" />
                          ) : (
                            <span className="text-xs font-bold text-text-muted">ADD IMAGE</span>
                          )}
                        </button>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <Input placeholder="Product Name" onChange={(e) => setProducts(prev => prev.map((pr, i) => i === idx ? { ...pr, name: e.target.value } : pr))} />
                          <Input placeholder="Category" onChange={(e) => setProducts(prev => prev.map((pr, i) => i === idx ? { ...pr, cat: e.target.value } : pr))} />
                          <Input placeholder="Unit Price Range" />
                          <Input placeholder="Unit Type" />
                        </div>
                      </div>
                    </Card>
                  ))}
                  {products.length < 4 && (
                    <Button variant="ghost" className="w-full h-14 border-2 border-dashed rounded-xl" onClick={() => setProducts([...products, { id: Date.now(), name: '', cat: '', price: '', unit: '', image: '' }])}>
                      + Add Another Product
                    </Button>
                  )}
                </div>
                <div className="mt-8">
                  <label className="block text-sm font-medium mb-2">Company Bio</label>
                  <textarea 
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="flex w-full rounded-xl border border-border bg-surface px-4 py-3 text-base placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent min-h-[100px] resize-none"
                    placeholder="Tell contractors about your logistics and quality standards..."
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Quality & Logistics</h1>
                <div className="flex flex-col gap-4 mb-8">
                  {CERTS.map(cert => (
                    <label key={cert} className="flex items-center gap-3 p-4 border border-border rounded-xl bg-surface cursor-pointer hover:border-accent-light transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-border text-accent focus:ring-accent-light"
                        checked={selectedCerts.includes(cert)}
                        onChange={() => toggleArrayItem(cert, setSelectedCerts)}
                      />
                      <span className="font-medium">{cert}</span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Typical Lead Time (Days)</label>
                    <Input placeholder="e.g. 3-5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Order Quantity (MOQ)</label>
                    <Input placeholder="e.g. 100 sqft or None" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Pricing & Terms</h1>
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-4">Payment Terms</label>
                  <select className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent">
                    <option>Cash on Delivery</option>
                    <option>Credit Terms (30/60 days)</option>
                    <option>Bank Transfer</option>
                    <option>Mixed</option>
                  </select>
                </div>
                <div className="mb-8">
                  <label className="flex items-center gap-3 mb-4 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-border text-accent" />
                    <span className="font-medium">Offer Bulk Discounts</span>
                  </label>
                  <textarea 
                    className="flex w-full rounded-xl border border-border bg-surface px-4 py-3 text-base placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent min-h-[80px] resize-none"
                    placeholder="Short note about bulk pricing (e.g. 10% off above 500 units)..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-4">Contact Preference</label>
                  <select className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent">
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>Phone Call</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            <Button variant="text" onClick={prevStep} disabled={step === 1} className={step === 1 ? 'invisible' : ''}>
              Back
            </Button>
            <Button size="lg" onClick={nextStep}>
              {step === totalSteps ? 'Complete Profile' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
