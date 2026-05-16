import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, MapPin, Package, Sparkles, ArrowRight, Inbox, Check, X, ChevronDown, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getContractors } from '../../lib/db';
import { getProjects, addNotification } from '../../lib/projects';
import Navbar from '../../components/layout/Navbar';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ai' | 'listings' | 'invitations'>('ai');
  const [contractors, setContractors] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);

  const isOnboarded = !!localStorage.getItem('buildlink_onboarded_supplier');
  const supplierData = useMemo(() => {
    const data = localStorage.getItem('buildlink_supplier_data');
    return data ? JSON.parse(data) : { tags: ['Timber & Wood'] };
  }, []);

  useEffect(() => {
    if (!isOnboarded) navigate('/onboarding/supplier');
    setContractors(getContractors());
    // Build invitations from projects
    const allProjects = getProjects();
    const myInvites: any[] = [];
    allProjects.forEach(p => {
      p.team.forEach(m => {
        if (m.type === 'supplier') {
          myInvites.push({
            id: `${p.id}-${m.profileId}`,
            projectId: p.id,
            projectName: p.name,
            location: p.location,
            projectType: p.type,
            budget: p.budget,
            scopesCovered: m.scopesCovered,
            status: m.status,
            description: p.description,
          });
        }
      });
    });
    setInvitations(myInvites);
  }, [isOnboarded, navigate]);

  const filteredContractors = useMemo(() => {
    return contractors.map(c => {
      const supplierCats = supplierData.tags || supplierData.categories || [];
      const matchCount = c.tags.filter((t: string) => 
        supplierCats.some((sc: string) => sc.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(sc.toLowerCase()))
      ).length;

      const score = supplierCats.length > 0 ? Math.min(100, Math.round((matchCount / 1) * 100)) : 0;
      return { ...c, score };
    }).filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [contractors, supplierData]);

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <div className="pt-32 pb-12 max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row gap-12">
        
        <main className="flex-1 min-w-0">
          <div className="flex gap-10 border-b border-border mb-10 overflow-x-auto no-scrollbar">
            {['ai', 'listings', 'inquiries'].map((tab) => (
              <button 
                key={tab}
                className={`pb-4 font-black text-[15px] uppercase tracking-widest transition-colors whitespace-nowrap relative ${activeTab === tab ? 'text-[#111]' : 'text-text-muted hover:text-[#111]'}`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab === 'ai' && 'AI Suggestions'}
                {tab === 'listings' && 'Inventory'}
                {tab === 'inquiries' && 'Inquiries'}
                {activeTab === tab && <motion.div layoutId="indicator_sup" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111]" />}
              </button>
            ))}
          </div>

          {activeTab === 'ai' && (
            <div>
              {!isOnboarded ? (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center min-h-[460px] text-center py-12"
                >
                  <div className="relative w-28 h-28 mx-auto mb-10">
                    <div className="absolute inset-0 rounded-full border border-accent/10 bg-accent/5 animate-pulse" />
                    <div className="absolute inset-[10px] rounded-full border border-accent/15 bg-accent/5" />
                    <div className="absolute inset-[20px] rounded-full border border-accent/25 bg-accent/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={30} className="text-accent" />
                    </div>
                  </div>
                  <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-text-muted mb-4">AI Matching</div>
                  <h2 className="text-4xl font-black tracking-tight text-[#111] mb-5 leading-[1.05]">
                    Your matches<br />are waiting.
                  </h2>
                  <p className="text-text-muted text-lg leading-relaxed mb-10 max-w-[340px] mx-auto">
                    Set up your catalogue so our AI can connect you with contractors actively searching for your materials.
                  </p>
                  <Link to="/onboarding/supplier">
                    <Button size="lg" className="px-10 h-14 rounded-xl text-[15px] shadow-xl shadow-accent/20 flex items-center gap-3">
                      Start Onboarding
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <h2 className="text-2xl font-black text-[#111] uppercase tracking-tight">Contractors Needing Your Materials</h2>
                  <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid gap-6">
                    {filteredContractors.length > 0 ? (
                      filteredContractors.map((c) => (
                        <motion.div variants={itemVars} key={c.id}>
                          <Card className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border-none shadow-xl rounded-[28px] bg-white group hover:shadow-2xl transition-all">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg">
                                  {c.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-black text-2xl text-[#111]">{c.name}</h3>
                                  <div className="flex items-center gap-3 text-sm font-bold text-text-muted uppercase tracking-wider">
                                    <MapPin size={14} /> {c.location}
                                  </div>
                                </div>
                                <div className="ml-auto md:ml-6 px-4 py-2 bg-accent/10 text-accent rounded-full font-black text-sm flex items-center gap-2">
                                  {c.score}% <span className="text-[10px] opacity-70">MATCH</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {c.tags.map((t: string) => (
                                  <span key={t} className="px-3 py-1 bg-surface border border-border rounded-lg text-[11px] font-bold text-[#111] uppercase tracking-wider">{t}</span>
                                ))}
                              </div>
                              <div className="text-sm font-bold text-text-muted italic">
                                Potential buyer for your {(supplierData.tags || supplierData.categories || []).join(', ')} catalog.
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 shrink-0">
                              <Button className="h-12 px-8 rounded-xl font-black">Send Offer</Button>
                              <Button variant="ghost" className="h-12 rounded-xl font-black border border-border">Profile</Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-20 text-center border-2 border-dashed border-border rounded-[32px]">
                        <p className="text-text-muted font-bold">No contractors currently needing your material categories.</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'listings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Product Listings</h2>
                <Button size="sm">+ Add New Product</Button>
              </div>
              <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  { name: 'Premium Teak Wood', cat: 'Timber & Wood', price: 'RM 45-60', unit: 'sqft' },
                  { name: 'Oak Laminate Flooring', cat: 'Flooring', price: 'RM 12-18', unit: 'sqft' },
                  { name: 'Solid Wood Doors', cat: 'Doors & Windows', price: 'RM 450+', unit: 'piece' },
                ].map((p, i) => (
                  <motion.div variants={itemVars} key={i}>
                    <Card className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-tag flex items-center justify-center text-text-muted">
                          <Package size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-surface border border-border rounded">{p.cat}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{p.name}</h3>
                      <div className="text-sm text-text-muted mb-4">{p.price} / {p.unit}</div>
                      <Button variant="ghost" className="mt-auto w-full" size="sm">Edit Listing</Button>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid gap-4">
              {[
                { from: 'KL Design & Build', product: 'Premium Teak Wood', date: 'Today', status: 'New' },
                { from: 'Homeowner JD', product: 'Solid Wood Doors', date: 'Yesterday', status: 'Replied' },
                { from: 'Solid Fix Co.', product: 'Oak Laminate Flooring', date: '3 days ago', status: 'Closed' },
              ].map((inq, i) => (
                <motion.div variants={itemVars} key={i}>
                  <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-tag flex items-center justify-center font-bold">
                        {inq.from.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold mb-1">{inq.from}</div>
                        <div className="text-sm text-text-muted">Asking about: {inq.product}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-xs text-text-muted w-20">{inq.date}</div>
                      <div className={`text-xs font-medium px-2 py-1 rounded w-16 text-center ${
                        inq.status === 'New' ? 'bg-accent-light text-accent' : 
                        inq.status === 'Replied' ? 'bg-tag text-text-primary' : 'bg-transparent border border-border text-text-muted'
                      }`}>
                        {inq.status}
                      </div>
                      <Button variant="ghost" size="sm">Reply</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>

        <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Profile Completeness</h3>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset="25" className="text-accent transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">90%</div>
            </div>
            <Button variant="ghost" className="w-full" size="sm">Add More Photos</Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-text-muted"><Package size={16}/> Total Products</div>
                <div className="font-semibold">3</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-text-muted"><MessageSquare size={16}/> Inquiries (Mo)</div>
                <div className="font-semibold">12</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-text-muted"><Eye size={16}/> Profile Views</div>
                <div className="font-semibold">89</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><MapPin size={18}/> Delivery Coverage</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Currently delivering to Klang Valley, Selangor, and Putrajaya. Express delivery available for KL city center.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
