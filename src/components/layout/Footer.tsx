import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#111] text-white pt-24 pb-12 overflow-hidden">
      {/* Brick Wall Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(335deg, #ffffff 5px, transparent 5px),
                            linear-gradient(155deg, #ffffff 5px, transparent 5px),
                            linear-gradient(335deg, #ffffff 5px, transparent 5px),
                            linear-gradient(155deg, #ffffff 5px, transparent 5px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px, 10px 10px, 0 0'
        }} 
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="space-y-8">
            <Link to="/" className="text-3xl font-black tracking-tighter">
              BuildLink<span className="text-accent">.</span>
            </Link>
            <p className="text-white/50 leading-relaxed text-sm max-w-xs">
              The platform that links homeowners, contractors and suppliers — intelligently. Building the future of construction.
            </p>
            <div className="flex gap-4">
              {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-[#111] transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-accent">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-white/70">
              <li><Link to="/onboarding/homeowner" className="hover:text-white transition-colors">Homeowners</Link></li>
              <li><Link to="/onboarding/contractor" className="hover:text-white transition-colors">Contractors</Link></li>
              <li><Link to="/onboarding/supplier" className="hover:text-white transition-colors">Suppliers</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-accent">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-accent">Newsletter</h4>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button className="absolute right-2 top-2 w-10 h-10 bg-accent rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="mt-4 text-[10px] text-white/30 uppercase font-black tracking-widest">No spam, just updates.</p>
          </div>

        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
            &copy; {new Date().getFullYear()} BuildLink. All rights reserved.
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/30">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
      
      {/* Decorative Brick Element */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent opacity-10 rounded-full blur-[120px] pointer-events-none" />
    </footer>
  );
}
