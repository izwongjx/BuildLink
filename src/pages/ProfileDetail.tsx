import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Award, Phone, Mail, MessageCircle, Bookmark, ShieldCheck, Clock, CheckCircle2, Eye, ArrowLeft, Share2, MoreHorizontal } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '@/lib/utils';

export default function ProfileDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeGalleryTab, setActiveGalleryTab] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('buildlink_saved_matches');
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsBookmarked(parsed.some((item: any) => item.id === id && item.type === type));
    }
    window.scrollTo(0, 0);
  }, [id, type]);

  // Mock data based on type
  const isContractor = type === 'contractor';
  
  const data = isContractor ? {
    name: 'Apex Renovations',
    role: 'Contractor',
    location: 'Kuala Lumpur',
    match: 94,
    rating: 4.8,
    reviews: 42,
    projects: 124,
    years: 12,
    price: 'Premium',
    avail: 'Available Now',
    about: "Apex Renovations specializes in high-end residential and commercial fit-outs. With over a decade of experience, we pride ourselves on meticulous attention to detail, transparent pricing, and delivering projects on time. We handle everything from design consultation to final handover.",
    tags: ['General Contracting', 'Interior Fit-Out', 'Carpentry', 'Smart Home Integration', 'Plumbing', 'Electrical'],
    certs: ['CIDB Registered', 'ISO Certified', 'Insured'],
    gallery: [
      { id: 1, title: 'Modern Kitchen', url: '/modern_kitchen_renovation.png' },
      { id: 2, title: 'Luxury Bathroom', url: '/modern_bathroom_detail.png' },
      { id: 3, title: 'Living Space', url: '/modern_kitchen_renovation.png' },
    ],
    coverage: 'Kuala Lumpur, Selangor'
  } : {
    name: 'Lumber Co.',
    role: 'Supplier',
    location: 'Selangor',
    match: 92,
    rating: 4.9,
    reviews: 128,
    projects: 500, // Deliveries
    years: 20,
    price: 'Wholesale',
    avail: 'In Stock',
    about: "Lumber Co. is a premier supplier of high-quality timber, engineered wood, and custom joinery materials. Sourcing sustainably, we provide contractors and builders with reliable, top-grade materials. Our logistics network ensures prompt delivery across the region.",
    tags: ['Timber & Wood', 'Flooring', 'Doors & Windows', 'Plywood', 'MDF'],
    certs: ['ISO Certified', 'SIRIM Approved', 'Sustainable Forestry'],
    gallery: [
      { id: 1, title: 'Premium Oak', url: '/timber_supplier_warehouse.png' },
      { id: 2, title: 'Engineered Pine', url: '/timber_supplier_warehouse.png' },
    ],
    coverage: 'Klang Valley, Penang, Johor'
  };

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

  const handleSendMessage = () => {
    navigate('/messages', { state: { recipient: data.name } });
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
                    {data.gallery.map((_, i) => (
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
                    <motion.img 
                      key={activeGalleryTab}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      src={data.gallery[activeGalleryTab].url} 
                      className="w-full h-full object-cover"
                      alt={data.gallery[activeGalleryTab].title}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 text-white/70">Portfolio Item</div>
                    <h3 className="text-3xl font-black tracking-tight">{data.gallery[activeGalleryTab].title}</h3>
                  </div>
                </div>
              </motion.section>

              {/* Tabs / Details */}
              <motion.section {...fadeInUp} className="space-y-16">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-6">Philosophy & Experience</h3>
                  <p className="text-xl md:text-2xl font-medium text-[#444] leading-relaxed max-w-3xl italic">
                    "{data.about}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-6">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map(tag => (
                        <span key={tag} className="px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-[#111] hover:border-accent transition-colors cursor-default">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-6">Verified Credentials</h3>
                    <div className="space-y-3">
                      {data.certs.map(cert => (
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
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted">
                          <Clock size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#111]">Start Date</div>
                          <div className="text-xs font-medium text-text-muted">Available from next month</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted">
                          <Award size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#111]">Verified Partner</div>
                          <div className="text-xs font-medium text-text-muted">BuildLink Certified Professional</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="px-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6">Coverage Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.coverage.split(', ').map(area => (
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
    </div>
  );
}
