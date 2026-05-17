import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Award, Package, MessageCircle, Bookmark, ShieldCheck, Clock, CheckCircle2, ArrowLeft, Share2, Tag, SendHorizonal, X, Truck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '@/lib/utils';

import { getProvider } from '@/lib/db';

export default function ProfileDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeGalleryTab, setActiveGalleryTab] = useState(0);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  // Fetch real data from db (localStorage + initial)
  const provider = useMemo(() => {
    if (!type || !id) return null;
    return getProvider(type, id);
  }, [type, id]);

  useEffect(() => {
    const saved = localStorage.getItem('buildlink_saved_matches');
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsBookmarked(parsed.some((item: any) => item.id === id && item.type === type));
    }
    window.scrollTo(0, 0);
  }, [id, type]);

  // ── Safe data merge ─────────────────────────────────────────────────────────
  // `provider` may come from demo data or onboarding data. Both can be missing
  // fields like avail/match/reviews/certs/gallery. We spread over a full set of
  // typed defaults so rendering never crashes on undefined.property access.
  const isContractor = type === 'contractor';

  const contractorDefaults = {
    name: 'New Contractor',
    role: 'Contractor',
    location: 'Malaysia',
    match: 90,
    rating: 5.0,
    reviews: 0,
    projects: 0,
    years: 1,
    price: 'Mid-Range',
    avail: 'Available Now',
    about: 'Expert contractor dedicated to high-quality craftsmanship and reliable service.',
    tags: [] as string[],
    certs: ['Verified Builder'],
    gallery: [
      { id: 1, title: 'Modern Kitchen', url: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=1000' },
      { id: 2, title: 'Luxury Bathroom', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000' },
    ],
    coverage: 'Malaysia',
    products: [] as string[],
  };

  const supplierDefaults = {
    name: 'New Supplier',
    role: 'Supplier',
    location: 'Malaysia',
    match: 90,
    rating: 5.0,
    reviews: 0,
    projects: 0,
    years: 1,
    price: 'Mid-Range',
    avail: 'In Stock',
    about: 'Leading supplier of premium building materials and hardware.',
    tags: [] as string[],
    certs: ['Quality Guaranteed'],
    gallery: [
      { id: 1, title: 'Premium Material', url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=1000' },
    ],
    coverage: 'Malaysia',
    products: (() => {
      const saved = localStorage.getItem('buildlink_supplier_products');
      return saved
        ? JSON.parse(saved).map((p: any) => p.name)
        : ['Premium Teak Wood', 'Oak Laminate Flooring', 'Solid Wood Doors'];
    })(),
  };

  const defaults = isContractor ? contractorDefaults : supplierDefaults;

  // Merge: defaults first, then real provider fields on top.
  // For arrays (tags, certs, gallery/portfolio) only override if the source has a non-empty value.
  const raw = provider || {};
  const data: typeof defaults & Record<string, any> = {
    ...defaults,
    ...raw,
    // Preserve arrays only when they actually contain items
    tags:  (raw as any).tags?.length  ? (raw as any).tags  : defaults.tags,
    certs: (raw as any).certs?.length ? (raw as any).certs : defaults.certs,
  };

  // Normalise gallery: onboarding saves as "portfolio", demo data as "gallery"
  const gallery: { id: number; title: string; url: string }[] =
    ((raw as any).portfolio?.length ? (raw as any).portfolio : null) ||
    ((raw as any).gallery?.length   ? (raw as any).gallery   : null) ||
    defaults.gallery;

  const handleBookmark = () => {
    const saved = localStorage.getItem('buildlink_saved_matches');
    let parsed = saved ? JSON.parse(saved) : [];
    
    if (isBookmarked) {
      parsed = parsed.filter((item: any) => !(item.id === id && item.type === type));
    } else {
      parsed.push({ id, type, name: data.name, role: data.role });
    }
    
    localStorage.setItem('buildlink_saved_matches', JSON.stringify(parsed));
    setIsBookmarked(!isBookmarked);
  };

  const handleSendMessage = (preselect?: string) => {
    setInquiryProduct(preselect || '');
    setInquiryMessage('');
    setInquirySent(false);
    setInquiryModalOpen(true);
  };

  const submitInquiry = () => {
    const saved = localStorage.getItem('buildlink_inquiries');
    const inquiries = saved ? JSON.parse(saved) : [
      { id: 1, from: 'KL Design & Build', product: 'Premium Teak Wood', date: 'Today', status: 'New' },
      { id: 2, from: 'Homeowner JD', product: 'Solid Wood Doors', date: 'Yesterday', status: 'Replied' },
      { id: 3, from: 'Solid Fix Co.', product: 'Oak Laminate Flooring', date: '3 days ago', status: 'Closed' },
    ];
    // Get the logged-in contractor name from localStorage
    const contractorRaw = localStorage.getItem('buildlink_contractor_data');
    const contractorData = contractorRaw ? JSON.parse(contractorRaw) : null;
    const senderName = contractorData?.companyName || contractorData?.name || 'Anonymous Contractor';
    const senderLocation = contractorData?.location || 'Malaysia';
    const senderServices = contractorData?.services || [];
    const inquiryId = Date.now();

    inquiries.unshift({
      id: inquiryId,
      from: senderName,
      product: inquiryProduct || 'General Inquiry',
      message: inquiryMessage,
      date: 'Just now',
      status: 'New'
    });
    localStorage.setItem('buildlink_inquiries', JSON.stringify(inquiries));

    // Also save as a contractor lead so it appears in supplier's AI Suggestions
    const leadsRaw = localStorage.getItem('buildlink_contractor_leads');
    const leads = leadsRaw ? JSON.parse(leadsRaw) : [];
    // Avoid duplicates by same sender+product
    const alreadyExists = leads.some((l: any) => l.name === senderName && l.product === inquiryProduct);
    if (!alreadyExists) {
      leads.unshift({
        id: inquiryId,
        name: senderName,
        location: senderLocation,
        tags: senderServices.length > 0 ? senderServices : ['General Contracting'],
        product: inquiryProduct,
        date: 'Just now',
        isInquiry: true,
      });
      localStorage.setItem('buildlink_contractor_leads', JSON.stringify(leads));
    }

    setInquirySent(true);
  };


  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          
          {/* Back Button & Actions */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-muted hover:text-[#111] transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to matches
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2.5 rounded-full border border-border hover:bg-surface transition-colors">
                <Share2 size={18} className="text-text-muted" />
              </button>
              <button className="p-2.5 rounded-full border border-border hover:bg-surface transition-colors">
                <MoreHorizontal size={18} className="text-text-muted" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
            
            {/* Left Content (Main) */}
            <div className="flex-1 min-w-0">
              
              {/* Profile Header */}
              <motion.div {...fadeInUp} className="mb-12">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-[#111] text-white text-[11px] font-black uppercase tracking-widest rounded-full">
                    {data.role}
                  </span>
                  <span className={cn(
                    "px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 border",
                    data.avail.includes('Available') || data.avail.includes('Stock') 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : "bg-surface border-border text-text-muted"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", data.avail.includes('Available') || data.avail.includes('Stock') ? "bg-green-500 animate-pulse" : "bg-text-muted")} />
                    {data.avail}
                  </span>
                  <span className="px-4 py-1.5 bg-accent/5 border border-accent/10 text-accent text-[11px] font-black uppercase tracking-widest rounded-full">
                    {data.match}% Match
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#111] mb-6 leading-[1] max-w-2xl">
                  {data.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100">
                      <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                      <div className="font-black text-lg text-[#111] leading-none">{data.rating}</div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">{data.reviews} Reviews</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center border border-accent/10">
                      <CheckCircle2 size={20} className="text-accent" />
                    </div>
                    <div>
                      <div className="font-black text-lg text-[#111] leading-none">{data.projects}+</div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">{isContractor ? 'Completed' : 'Orders'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-border">
                      <MapPin size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <div className="font-black text-lg text-[#111] leading-none">{data.location}</div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">HQ Location</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Gallery Section */}
              <motion.section {...fadeInUp} className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tight text-[#111] uppercase">
                    {isContractor ? 'Recent Projects' : 'Product Catalogue'}
                  </h2>
                  <div className="flex gap-2">
                    {gallery.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setActiveGalleryTab(i)}
                        className={cn(
                          "w-3 h-3 rounded-full transition-all",
                          activeGalleryTab === i ? "bg-accent w-8" : "bg-border"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative aspect-[16/9] rounded-[32px] overflow-hidden group border border-border shadow-2xl">
                  <AnimatePresence mode="wait">
                    {gallery.length > 0 ? (
                      <motion.img 
                        key={activeGalleryTab}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        src={gallery[activeGalleryTab]?.url} 
                        className="w-full h-full object-cover"
                        alt={gallery[activeGalleryTab]?.title}
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center text-text-muted font-bold">No portfolio images available</div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 text-white/70">Portfolio Item</div>
                    <h3 className="text-3xl font-black tracking-tight">{gallery[activeGalleryTab]?.title || 'Work Preview'}</h3>
                  </div>
                </div>
              </motion.section>

              {/* About */}
              <motion.section {...fadeInUp} className="mb-12">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-4">
                  {isContractor ? 'Philosophy & Experience' : 'About This Supplier'}
                </h3>
                <p className="text-xl md:text-2xl font-medium text-[#444] leading-relaxed max-w-3xl italic">
                  "{data.about}"
                </p>
              </motion.section>

              {/* ── SUPPLIER: Products Grid ──────────────────────────────── */}
              {!isContractor && (
                <motion.section {...fadeInUp} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">
                      Products & Materials
                    </h3>
                    <span className="text-xs font-bold text-text-muted">
                      {data.products?.length || 0} items available
                    </span>
                  </div>

                  {data.products?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.products.map((product: string, idx: number) => (
                        <motion.div
                          key={product}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.07 } }}
                          className="group bg-white border border-[#E4E2DC] rounded-2xl p-5 hover:border-[#E8642A] hover:shadow-md transition-all"
                        >
                          {/* Icon + name */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FDF3EE] flex items-center justify-center shrink-0">
                              <Package size={22} className="text-[#E8642A]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-[15px] text-[#111] leading-tight mb-1 truncate">{product}</h4>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-green-600">In Stock</span>
                              </div>
                            </div>
                          </div>

                          {/* Tags from supplier categories */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {(data.tags as string[]).slice(0, 2).map((tag: string) => (
                              <span key={tag} className="px-2 py-0.5 bg-[#F7F6F3] border border-[#E4E2DC] rounded text-[10px] font-bold text-[#555] uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* CTA */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSendMessage(product)}
                            className="w-full flex items-center justify-center gap-2 h-10 bg-[#111] text-white rounded-xl font-bold text-[13px] hover:bg-[#E8642A] transition-colors"
                          >
                            <SendHorizonal size={14} />
                            Send Inquiry
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-[#E4E2DC] rounded-2xl">
                      <Package size={32} className="text-[#D4D2CC] mx-auto mb-3" />
                      <p className="text-[#888880] font-bold">No products listed yet.</p>
                    </div>
                  )}
                </motion.section>
              )}

              {/* Expertise & Credentials */}
              <motion.section {...fadeInUp} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-6">
                      {isContractor ? 'Expertise' : 'Product Categories'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag: string) => (
                        <span key={tag} className="px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-[#111] hover:border-accent transition-colors cursor-default">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-6">Verified Credentials</h3>
                    <div className="space-y-3">
                      {data.certs.map((cert: string) => (
                        <div key={cert} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                            <ShieldCheck size={20} />
                          </div>
                          <span className="font-bold text-[#111]">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Right Sidebar (Sticky Actions) */}
            <aside className="w-full lg:w-[400px] flex-shrink-0">
              <div className="sticky top-32 space-y-8">
                
                <Card className="p-10 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] rounded-[40px] bg-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-1">Pricing</div>
                        <div className="text-2xl font-black text-[#111]">{data.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-1">Experience</div>
                        <div className="text-2xl font-black text-[#111]">{data.years} Yrs</div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-10">
                      <Button size="lg" className="w-full h-16 rounded-[20px] text-lg font-black shadow-xl shadow-accent/20" onClick={handleSendMessage}>
                        Send Inquiry
                      </Button>
                      <div className="flex gap-4">
                        <Button 
                          variant={isBookmarked ? 'filled' : 'ghost'} 
                          size="lg" 
                          className={cn(
                            "flex-1 h-16 rounded-[20px] font-black border-2",
                            isBookmarked ? "bg-accent border-accent text-white" : "border-border"
                          )}
                          onClick={handleBookmark}
                        >
                          <Bookmark size={20} className={cn("mr-2", isBookmarked && "fill-white")} />
                          {isBookmarked ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="ghost" size="lg" className="h-16 w-16 rounded-[20px] border-2 border-border p-0">
                          <MessageCircle size={20} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-border">
                      {isContractor ? (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted">
                              <Clock size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-[#111]">Availability</div>
                              <div className="text-xs font-medium text-text-muted">{data.avail}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted">
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-[#111]">Verified Partner</div>
                              <div className="text-xs font-medium text-text-muted">BuildLink Certified Professional</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FDF3EE] flex items-center justify-center text-[#E8642A]">
                              <Truck size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-[#111]">Delivery</div>
                              <div className="text-xs font-medium text-text-muted">Ships to {data.coverage || data.location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FDF3EE] flex items-center justify-center text-[#E8642A]">
                              <Tag size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-[#111]">{data.products?.length || 0} Products Listed</div>
                              <div className="text-xs font-medium text-text-muted">All items currently in stock</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FDF3EE] flex items-center justify-center text-[#E8642A]">
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-[#111]">Verified Supplier</div>
                              <div className="text-xs font-medium text-text-muted">BuildLink Quality Partner</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="px-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">Coverage Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {(data.coverage || data.location || 'Klang Valley').split(', ').map(area => (
                      <span key={area} className="text-sm font-bold text-[#111] flex items-center gap-2">
                        <MapPin size={14} className="text-accent" />
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </aside>
          </div>

        </div>
      </main>

      <Footer />

      {/* Inquiry Modal */}
      <AnimatePresence>
        {inquiryModalOpen && (
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
              {inquirySent ? (
                <>
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-[#111] mb-2">Inquiry Sent!</h3>
                    <p className="text-text-muted text-sm mb-6">Your inquiry for <span className="font-bold text-[#111]">{inquiryProduct}</span> has been sent to the supplier. They will review and respond shortly.</p>
                    <Button className="w-full rounded-xl h-11 font-bold" onClick={() => setInquiryModalOpen(false)}>
                      Done
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-[#111]">Send Inquiry</h3>
                    <button onClick={() => setInquiryModalOpen(false)} className="text-[#888880] hover:text-[#111]">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#111] mb-1">Product</label>
                      <select
                        value={inquiryProduct}
                        onChange={(e) => setInquiryProduct(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] text-[14px] focus:outline-none focus:border-[#E8642A]"
                      >
                        <option value="" disabled>Select a product to inquire...</option>
                        {(data as any).products?.map((p: string) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#111] mb-1">Message <span className="font-normal text-text-muted">(optional)</span></label>
                      <textarea
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        rows={3}
                        placeholder="e.g. We need approx. 200 sqft, delivery to Subang Jaya..."
                        className="w-full px-3 py-2 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] text-[14px] focus:outline-none focus:border-[#E8642A] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      className="flex-1 rounded-xl h-11 font-bold"
                      onClick={submitInquiry}
                      disabled={!inquiryProduct}
                    >
                      Send Inquiry
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-xl h-11 font-bold border border-border"
                      onClick={() => setInquiryModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
