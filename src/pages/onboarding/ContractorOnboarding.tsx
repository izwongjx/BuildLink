import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const SERVICES = ['General Contracting', 'Renovation', 'Carpentry', 'Flooring', 'Electrical', 'Plumbing', 'Painting', 'Tiling', 'Roofing', 'Glass Works', 'Steel Works', 'Interior Fit-Out', 'Landscaping', 'Other'];
const CERTS = ['CIDB Registered', 'BOMBA Compliant', 'ISO Certified', 'Insured', 'None'];

export default function ContractorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);

  const slideVars = {
    initial: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.3 } })
  };

  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [portfolio, setPortfolio] = useState<string[]>([]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const newContractor = {
        id: Date.now(),
        name: businessName || 'New Contractor',
        location: location || 'Malaysia',
        tags: selectedServices,
        rating: 5.0,
        price: selectedPrice || 'Mid-Range',
        about: about || "Expert contractor dedicated to high-quality craftsmanship and reliable service.",
        portfolio: portfolio.length > 0 ? portfolio.map((url, i) => ({ id: i, title: `Project ${i+1}`, url })) : [
          { id: 1, title: 'Modern Renovation', url: '/modern_kitchen_renovation.png' },
          { id: 2, title: 'Luxury Detail', url: '/modern_bathroom_detail.png' }
        ],
        certs: selectedCerts.length > 0 ? selectedCerts : ['Verified Builder'],
        role: 'Contractor'
      };

      // 1. Add to global list for homeowners to see
      const existing = localStorage.getItem('buildlink_contractors');
      const contractors = existing ? JSON.parse(existing) : [];
      localStorage.setItem('buildlink_contractors', JSON.stringify([...contractors, newContractor]));

      // 2. Save individual session data for matching
      localStorage.setItem('buildlink_contractor_data', JSON.stringify(newContractor));
      localStorage.setItem('buildlink_onboarded_contractor', 'true');
      
      navigate('/dashboard/contractor');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayItem = (item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
        <div className="font-semibold text-[#111]">BuildLink</div>
        <div className="text-sm font-medium text-text-muted">Step {step} of {totalSteps}</div>
        <div className="w-10"></div> {/* Placeholder for balance */}
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
              <motion.div key="c1" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Business Info</h1>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name</label>
                    <Input 
                      placeholder="Apex Renovations Sdn Bhd" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Years in Operation</label>
                      <select className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent">
                        <option>Less than 1 year</option>
                        <option>1-3 years</option>
                        <option>3-10 years</option>
                        <option>10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <Input 
                        placeholder="State / City" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="c2" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Services Offered</h1>
                <div className="flex flex-wrap gap-3 mb-6">
                  {SERVICES.map(svc => (
                    <button
                      key={svc}
                      onClick={() => toggleArrayItem(svc, setSelectedServices)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        selectedServices.includes(svc) ? 'bg-accent text-white border-accent' : 'bg-surface border-border hover:border-accent-light hover:bg-accent-light/30'
                      }`}
                    >
                      {svc}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Add custom service</label>
                  <Input placeholder="e.g. Smart Home Integration" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="c3" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Portfolio</h1>
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-4">Upload past work (Select to add demo images)</label>
                  <div className="grid grid-cols-3 gap-4">
                    {portfolio.map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                        <img src={url} alt="Portfolio" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setPortfolio(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {portfolio.length < 6 && (
                      <button 
                        onClick={() => {
                          const demo = [
                            '/modern_kitchen_renovation.png',
                            '/modern_bathroom_detail.png',
                            '/timber_supplier_warehouse.png'
                          ];
                          const next = demo[portfolio.length % demo.length];
                          setPortfolio(prev => [...prev, next]);
                        }}
                        className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-surface hover:bg-accent-light/10 transition-colors cursor-pointer"
                      >
                        <span className="text-text-muted text-2xl">+</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Add Image</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Bio / About</label>
                  <textarea 
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="flex w-full rounded-xl border border-border bg-surface px-4 py-3 text-base placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent min-h-[100px] resize-none"
                    placeholder="Tell clients about your expertise..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website / Instagram (Optional)</label>
                  <Input placeholder="https://" />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="c4" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Certifications</h1>
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
                <div>
                  <label className="block text-sm font-medium mb-2">License Number (Optional)</label>
                  <Input placeholder="e.g. CIDB Registration No." />
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="c5" custom={1} variants={slideVars} initial="initial" animate="animate" exit="exit">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Pricing & Availability</h1>
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-4">Typical Price Range</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Budget', 'Mid-Range', 'Premium', 'Negotiable'].map(p => (
                      <Card 
                        key={p} 
                        hoverable 
                        onClick={() => setSelectedPrice(p)}
                        className={`p-6 text-center cursor-pointer font-bold text-lg transition-all border-2 ${
                          selectedPrice === p ? 'border-accent bg-accent/5' : 'border-transparent'
                        }`}
                      >
                        {p}
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-4">Availability</label>
                  <select className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent">
                    <option>Available Now</option>
                    <option>Open to New Projects</option>
                    <option>Fully Booked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-4">Materials Sourcing</label>
                  <select className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:border-accent">
                    <option>I source my own materials</option>
                    <option>Client provides materials</option>
                    <option>Either works</option>
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
