import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';
import { User, Bell, Menu } from 'lucide-react';
import { getUnreadCount } from '../../lib/projects';
import NotificationPanel from '../projects/NotificationPanel';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomeowner = !!localStorage.getItem('buildlink_onboarded_homeowner');
  const isContractor = !!localStorage.getItem('buildlink_onboarded_contractor');
  const isSupplier = !!localStorage.getItem('buildlink_onboarded_supplier');
  const isAuthenticated = !!localStorage.getItem('buildlink_authenticated');
  const isLoggedIn = isHomeowner || isContractor || isSupplier || isAuthenticated;

  const dashboardPath = isHomeowner
    ? '/dashboard/homeowner'
    : isContractor
    ? '/dashboard/contractor'
    : '/dashboard/supplier';

  // Resolve the real profile path using the saved onboarding ID
  const profilePath = (() => {
    if (isContractor) {
      const raw = localStorage.getItem('buildlink_contractor_data');
      const id = raw ? JSON.parse(raw).id : null;
      return id ? `/profile/contractor/${id}` : '/dashboard/contractor';
    }
    if (isSupplier) {
      const raw = localStorage.getItem('buildlink_supplier_data');
      const id = raw ? JSON.parse(raw).id : null;
      return id ? `/profile/supplier/${id}` : '/dashboard/supplier';
    }
    // Homeowner — no dedicated profile page, point to dashboard
    return '/dashboard/homeowner';
  })();

  const refreshUnread = () => setUnread(getUnreadCount());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    refreshUnread();
    const handler = () => refreshUnread();
    window.addEventListener('buildlink_notif_update', handler);
    // Poll every 3s for new notifications (from simulated delays)
    const interval = setInterval(refreshUnread, 3000);
    return () => {
      window.removeEventListener('buildlink_notif_update', handler);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('buildlink_authenticated');
    localStorage.removeItem('buildlink_onboarded_homeowner');
    localStorage.removeItem('buildlink_onboarded_contractor');
    localStorage.removeItem('buildlink_onboarded_supplier');
    localStorage.removeItem('buildlink_homeowner_data');
    window.location.href = '/';
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center',
      scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-black tracking-tighter text-[#111]">
            BuildLink<span className="text-[#E8642A]">.</span>
          </Link>

          {isLoggedIn && location.pathname !== '/' && (
            <nav className="hidden lg:flex items-center gap-8 text-[14px] font-bold uppercase tracking-wider text-text-muted">
              <Link to={dashboardPath} className={cn('hover:text-[#111] transition-colors', location.pathname.includes('/dashboard') && 'text-[#111]')}>Dashboard</Link>
              {isHomeowner && (
                <Link to="/projects" className={cn('hover:text-[#111] transition-colors', location.pathname === '/projects' && 'text-[#111]')}>Projects</Link>
              )}
              <Link to="/saved" className={cn('hover:text-[#111] transition-colors', location.pathname === '/saved' && 'text-[#111]')}>Saved</Link>
              <Link to="/messages" className={cn('hover:text-[#111] transition-colors', location.pathname === '/messages' && 'text-[#111]')}>Messages</Link>
            </nav>
          )}

          {!isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-8 text-[14px] font-bold uppercase tracking-wider text-text-muted">
              <a href="#how-it-works" className="hover:text-[#111] transition-colors">Process</a>
              <a href="#contractors" className="hover:text-[#111] transition-colors">Contractors</a>
              <a href="#suppliers" className="hover:text-[#111] transition-colors">Suppliers</a>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              {/* Bell */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifOpen(prev => !prev)}
                  className="p-2 text-text-muted hover:text-[#111] transition-colors relative"
                >
                  <Bell size={20} />
                  <AnimatePresence>
                    {unread > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#E8642A] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1"
                      >
                        {unread}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <AnimatePresence>
                  {notifOpen && (
                    <NotificationPanel
                      onClose={() => setNotifOpen(false)}
                      onNavigate={(path) => navigate(path)}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-4 pl-6 border-l border-border">
                <Link to={profilePath} className="flex items-center gap-3 group">
                  <span className="text-sm font-black uppercase tracking-widest text-[#111] group-hover:text-[#E8642A] transition-colors">My Account</span>
                  <div className="w-10 h-10 rounded-full bg-[#E8642A] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    <User size={20} />
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost" className="font-bold text-sm uppercase tracking-wider">Sign In</Button></Link>
              <Link to="/auth"><Button className="px-6 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-accent/20">Get Started</Button></Link>
            </>
          )}
          <button className="lg:hidden p-2 text-[#111]"><Menu size={24} /></button>
        </div>
      </div>
    </header>
  );
}
