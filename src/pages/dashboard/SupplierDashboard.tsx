import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, Package, Sparkles, ArrowRight, Inbox,
  Check, X, ChevronDown, Loader2, ExternalLink, MessageSquare, Eye, Send
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getContractors } from '../../lib/db';
import { getProjects, addNotification } from '../../lib/projects';
import Navbar from '../../components/layout/Navbar';
import {
  scoreContractorForSupplier, sortByScore, matchBadgeStyle
} from '../../lib/matchingEngine';
import {
  getInvitations, addInvitation, updateInvitationStatus,
  Invitation as LibInvitation
} from '../../lib/invitations';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ai' | 'listings' | 'inquiries'>('ai');
  
  const INITIAL_PRODUCTS = [
    { id: 1, name: 'Premium Teak Wood', cat: 'Timber & Wood', price: 'RM 45-60', unit: 'sqft' },
    { id: 2, name: 'Oak Laminate Flooring', cat: 'Flooring', price: 'RM 12-18', unit: 'sqft' },
    { id: 3, name: 'Solid Wood Doors', cat: 'Doors & Windows', price: 'RM 450+', unit: 'piece' },
  ];
  
  const [products, setProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('buildlink_supplier_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const saveProducts = (updated: any[]) => {
    setProducts(updated);
    localStorage.setItem('buildlink_supplier_products', JSON.stringify(updated));
  };

  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Dynamic inquiries list linked to buildlink_inquiries
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);

  // Local notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Track sent offers/invitations
  const [sentOfferIds, setSentOfferIds] = useState<Record<string, boolean>>({});

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [contractors, setContractors] = useState<any[]>([]);

  const isOnboarded = !!localStorage.getItem('buildlink_onboarded_supplier');
  
  const supplierData = useMemo(() => {
    const data = localStorage.getItem('buildlink_supplier_data');
    return data ? JSON.parse(data) : { id: 'supplier-1', name: 'Lumber Co.', tags: ['Timber & Wood'] };
  }, []);

  const supplierId = supplierData.id || 'supplier-1';

  const loadData = () => {
    setContractors(getContractors());
    
    // Load local inquiries
    const savedInq = localStorage.getItem('buildlink_inquiries');
    if (savedInq) {
      setInquiriesList(JSON.parse(savedInq));
    } else {
      const defaultInq = [
        { id: 1, from: 'Apex Renovations', product: 'Premium Teak Wood', date: 'Today', status: 'New' },
        { id: 2, from: 'Homeowner JD', product: 'Solid Wood Doors', date: 'Yesterday', status: 'Replied' },
        { id: 3, from: 'Solid Fix Co.', product: 'Oak Laminate Flooring', date: '3 days ago', status: 'Closed' },
      ];
      setInquiriesList(defaultInq);
      localStorage.setItem('buildlink_inquiries', JSON.stringify(defaultInq));
    }
  };

  useEffect(() => {
    if (!isOnboarded) navigate('/onboarding/supplier');
    loadData();
  }, [isOnboarded, navigate]);

  const handleStatusChange = (id: number, status: string) => {
    const updated = inquiriesList.map(inq => inq.id === id ? { ...inq, status } : inq);
    setInquiriesList(updated);
    localStorage.setItem('buildlink_inquiries', JSON.stringify(updated));
    triggerToast(`Inquiry status updated to: ${status}`);
  };

  // Score contractors for supplier
  const scoredContractors = useMemo(() => {
    const scored = contractors.map(c => {
      const { score, matchedOn } = scoreContractorForSupplier(c, supplierData);
      return { ...c, score, matchedOn };
    });
    return sortByScore(scored);
  }, [contractors, supplierData]);

  // Send product offer to contractor
  const handleSendOffer = (contractor: any, matchedTags: string[]) => {
    addInvitation({
      fromType: 'supplier',
      fromId: String(supplierId),
      fromName: supplierData.name || supplierData.businessName || 'Lumber Co.',
      toHomeownerId: null,
      toSupplierId: null,
      toContractorId: String(contractor.id),
      projectId: null,
      scopesOffered: null,
      materialsOffered: matchedTags,
      materialsNeeded: null,
      message: `Hi ${contractor.name}, we saw your contracting profiles and can supply ${matchedTags.join(', ')} for your jobs!`,
    });
    setSentOfferIds(prev => ({ ...prev, [contractor.id]: true }));
    triggerToast(`Offer sent to ${contractor.name} successfully!`);
    loadData();
  };

  const containerVars = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVars = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="min-h-screen bg-background font-sans relative">
      <Navbar />

      {/* Global Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#111] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-[13px] border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-[#1A7A4A] animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
                    <div className="absolute inset-0 rounded-full border border-[#1A7A4A]/10 bg-[#1A7A4A]/5 animate-pulse" />
                    <div className="absolute inset-[10px] rounded-full border border-[#1A7A4A]/15 bg-[#1A7A4A]/5" />
                    <div className="absolute inset-[20px] rounded-full border border-[#1A7A4A]/25 bg-[#1A7A4A]/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={30} className="text-[#1A7A4A]" />
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
                    <Button size="lg" className="px-10 h-14 rounded-xl text-[15px] shadow-xl flex items-center gap-3 bg-[#1A7A4A] hover:bg-[#15633C]">
                      Start Onboarding
                      <ArrowRight size={18} />
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <h2 className="text-2xl font-black text-[#111] uppercase tracking-tight">Contractors Needing Your Materials</h2>
                  <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid gap-6">
                    {scoredContractors.length > 0 ? (
                      scoredContractors.map((c) => {
                        const badge = matchBadgeStyle(c.score);
                        const hasSent = sentOfferIds[c.id];
                        const isZero = c.score === 0;

                        return (
                          <motion.div
                            variants={itemVars}
                            key={c.id}
                            style={{ opacity: isZero ? 0.65 : 1 }}
                          >
                            <Card className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border border-[#E4E2DC] shadow-sm rounded-[28px] bg-white group hover:shadow-md transition-all">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-[#E8F5EC] text-[#1A7A4A] flex items-center justify-center font-black text-lg">
                                    {c.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h3 className="font-black text-2xl text-[#111]">{c.name}</h3>
                                    <div className="flex items-center gap-3 text-sm font-bold text-text-muted uppercase tracking-wider">
                                      <MapPin size={14} /> {c.location}
                                    </div>
                                  </div>
                                  <div
                                    className="ml-auto md:ml-6 px-4 py-1.5 rounded-full font-black text-sm flex items-center gap-2"
                                    style={{ background: badge.bg, color: badge.text }}
                                  >
                                    {badge.label}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {c.tags.map((t: string) => {
                                    const matched = (c.matchedOn || []).includes(t);
                                    return (
                                      <span
                                        key={t}
                                        className="px-3 py-1 rounded-lg text-[11px] font-bold text-[#111] uppercase tracking-wider transition-all"
                                        style={matched ? { background: '#E8F5EC', color: '#1A7A4A', border: '1px solid #1A7A4A' } : { background: '#F7F6F3', color: '#888880', border: '1px solid #E4E2DC' }}
                                      >
                                        {t}
                                      </span>
                                    );
                                  })}
                                </div>
                                <div className="text-sm font-bold text-text-muted italic">
                                  Uses {(c.matchedOn || []).join(', ')} categories regularly.
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <Button
                                  variant="ghost"
                                  className="h-12 rounded-xl font-black border border-border"
                                  onClick={() => navigate(`/profile/contractor/${c.id}`)}
                                >
                                  Profile
                                </Button>
                                <Button
                                  onClick={() => handleSendOffer(c, c.matchedOn || [])}
                                  disabled={hasSent}
                                  className="h-12 px-8 rounded-xl font-black transition-all"
                                  style={hasSent ? { background: '#E8F5EC', color: '#1A7A4A' } : { background: '#1A7A4A', color: '#FFF' }}
                                >
                                  {hasSent ? 'Sent ✓' : 'Send Materials Offer'}
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })
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
                <Button size="sm" onClick={() => setEditingProduct({ id: Date.now(), name: '', cat: '', price: '', unit: '', isNew: true })}>+ Add New Product</Button>
              </div>
              <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <motion.div variants={itemVars} key={p.id}>
                    <Card className="p-5 flex flex-col h-full border border-[#E4E2DC] rounded-2xl bg-white shadow-sm hover:border-[#1A7A4A] transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-tag flex items-center justify-center text-text-muted">
                          <Package size={20} />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-surface border border-border rounded">{p.cat}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{p.name}</h3>
                      <div className="text-sm text-text-muted mb-4">{p.price} / {p.unit}</div>
                      <Button variant="ghost" className="mt-auto w-full border border-[#E4E2DC]" size="sm" onClick={() => setEditingProduct(p)}>Edit Listing</Button>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid gap-4">
              {inquiriesList.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-[#E4E2DC] rounded-[24px]">
                  <MessageSquare size={40} className="text-[#D4D2CC] mx-auto mb-4" />
                  <p className="text-[#888880] font-bold text-[16px]">No inquiries received yet</p>
                </div>
              ) : (
                inquiriesList.map((inq, i) => (
                  <motion.div variants={itemVars} key={inq.id || i}>
                    <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E4E2DC] rounded-2xl bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#E8F5EC] text-[#1A7A4A] flex items-center justify-center font-bold">
                          {inq.from.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold mb-1">{inq.from}</div>
                          <div className="text-sm text-text-muted">Asking about: <span className="font-bold text-[#111]">{inq.product}</span></div>
                          {inq.message && <p className="text-[12px] text-[#555] italic mt-1">"{inq.message}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-xs text-text-muted w-20">{inq.date || 'Today'}</div>
                        <div className={`text-xs font-semibold px-2.5 py-1 rounded w-24 text-center ${
                          inq.status === 'New' ? 'bg-[#FEF3C7] text-[#92400E]' : 
                          inq.status === 'Supplying' ? 'bg-[#E8F5EC] text-[#1A7A4A]' :
                          inq.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-transparent border border-border text-text-muted'
                        }`}>
                          {inq.status}
                        </div>
                        
                        {inq.status === 'New' ? (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700 font-bold" onClick={() => handleStatusChange(inq.id, 'Supplying')}>Supply</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold" onClick={() => handleStatusChange(inq.id, 'Rejected')}>Reject</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" disabled className="opacity-50">Handled</Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </main>

        <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
          <Card className="p-6 border border-[#E4E2DC] rounded-2xl bg-white">
            <h3 className="font-semibold mb-4">Profile Completeness</h3>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#E4E2DC]" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset="25" className="text-[#1A7A4A] transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">90%</div>
            </div>
            <Button variant="ghost" className="w-full font-bold border border-[#E4E2DC]" size="sm">Add More Photos</Button>
          </Card>

          <Card className="p-6 border border-[#E4E2DC] rounded-2xl bg-white">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-text-muted"><Package size={16}/> Total Products</div>
                <div className="font-semibold">{products.length}</div>
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

          <Card className="p-6 border border-[#E4E2DC] rounded-2xl bg-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><MapPin size={18}/> Delivery Coverage</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Currently delivering to Klang Valley, Selangor, and Putrajaya. Express delivery available for KL city center.
            </p>
          </Card>
        </aside>
      </div>

      {/* Product Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#E4E2DC]"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-[#111]">{editingProduct.isNew ? 'Add New Product' : 'Edit Product'}</h3>
                <button onClick={() => setEditingProduct(null)} className="text-[#888880] hover:text-[#111]">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#111] mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full h-11 px-3 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] text-[14px] focus:outline-none focus:border-[#E8642A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#111] mb-1">Category</label>
                  <select
                    value={editingProduct.cat}
                    onChange={(e) => setEditingProduct({...editingProduct, cat: e.target.value})}
                    className="w-full h-11 px-3 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] text-[14px] focus:outline-none focus:border-[#E8642A]"
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="Timber & Wood">Timber & Wood</option>
                    <option value="Flooring">Flooring</option>
                    <option value="Doors & Windows">Doors & Windows</option>
                    <option value="Cement & Concrete">Cement & Concrete</option>
                    <option value="Bricks & Blocks">Bricks & Blocks</option>
                    <option value="Roofing">Roofing</option>
                    <option value="Plumbing Materials">Plumbing Materials</option>
                    <option value="Electrical Supplies">Electrical Supplies</option>
                    <option value="Paints & Finishes">Paints & Finishes</option>
                    <option value="Steel & Metal">Steel & Metal</option>
                    <option value="Tiles & Ceramics">Tiles & Ceramics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111] mb-1">Price</label>
                    <input
                      type="text"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                      className="w-full h-11 px-3 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] text-[14px] focus:outline-none focus:border-[#E8642A]"
                      placeholder="e.g. RM 45"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#111] mb-1">Unit</label>
                    <input
                      type="text"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})}
                      className="w-full h-11 px-3 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] text-[14px] focus:outline-none focus:border-[#E8642A]"
                      placeholder="e.g. sqft"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  className="flex-1 rounded-xl h-11 font-bold bg-[#1A7A4A] hover:bg-[#15633C]" 
                  onClick={() => {
                    if (editingProduct.isNew) {
                      saveProducts([...products, { ...editingProduct, id: Date.now() }]);
                    } else {
                      saveProducts(products.map((p: any) => p.id === editingProduct.id ? editingProduct : p));
                    }
                    setEditingProduct(null);
                  }}
                >
                  Save Product
                </Button>
                {!editingProduct.isNew && (
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-xl h-11 font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      saveProducts(products.filter((p: any) => p.id !== editingProduct.id));
                      setEditingProduct(null);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
