import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, HardHat, Truck, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

type Role = 'homeowner' | 'contractor' | 'supplier' | null;

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>(null);
  const [isLogin, setIsLogin] = useState(false);

  const slideVars = {
    initial: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.4 } })
  };

  const handleRoleSelect = (selected: Role) => {
    setRole(selected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    if (isLogin) {
      // Simulate login
      localStorage.setItem('buildlink_authenticated', 'true');
      localStorage.setItem(`buildlink_onboarded_${role}`, 'true');
      navigate(`/dashboard/${role}`);
    } else {
      localStorage.setItem('buildlink_authenticated', 'true');
      navigate(`/onboarding/${role}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface font-sans text-text-primary selection:bg-accent-light selection:text-accent">
      
      {/* LEFT PANEL: BRAND / EDITORIAL */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-16 xl:p-24 bg-background overflow-hidden border-r border-border">
        {/* Architectural abstract SVG graphic */}
        <svg 
          className="absolute -right-32 -top-32 w-[900px] h-[900px] text-text-primary opacity-[0.03] pointer-events-none" 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5"
        >
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="25" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="15" y1="15" x2="85" y2="85" />
          <rect x="25" y="25" width="50" height="50" />
        </svg>

        <div className="relative z-10">
          <div className="text-3xl font-black tracking-tight mb-2 text-[#111]">BuildLink.</div>
          <div className="text-text-muted font-medium tracking-wide">Connect. Build. Deliver.</div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="w-12 h-[2px] bg-accent mb-10" />
          <p className="text-4xl font-semibold leading-[1.15] tracking-tight mb-8 text-[#111]">
            "BuildLink transformed how we source projects. We're consistently matched with homeowners who are ready to build."
          </p>
          <div className="text-sm font-bold text-text-muted tracking-widest uppercase">
            — Metro Contractors
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-16 lg:p-24 relative overflow-hidden bg-surface">
        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
            
            {/* STEP 1: ROLE SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={-1}
                variants={slideVars}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="mb-12">
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-[#111]">I am a...</h1>
                  <p className="text-lg text-text-muted">Select your role to continue.</p>
                </div>

                <div className="flex flex-col gap-4 mb-10">
                  {[
                    { id: 'homeowner', icon: Home, title: 'Homeowner', desc: 'Looking to build or renovate' },
                    { id: 'contractor', icon: HardHat, title: 'Contractor', desc: 'Offering building services' },
                    { id: 'supplier', icon: Truck, title: 'Supplier', desc: 'Providing building materials' },
                  ].map((item) => {
                    const isSelected = role === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleRoleSelect(item.id as Role)}
                        className={`w-full group text-left p-6 flex items-center gap-6 rounded-[14px] transition-all duration-300 border ${
                          isSelected 
                            ? 'border-accent bg-accent-light/30 shadow-sm' 
                            : 'border-border bg-surface hover:border-text-muted hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isSelected 
                            ? 'bg-accent text-white' 
                            : 'bg-background text-text-primary group-hover:bg-accent/10 group-hover:text-accent'
                        }`}>
                          <item.icon size={24} strokeWidth={1.5} />
                        </div>
                        
                        <div>
                          <div className={`font-bold text-xl mb-1 transition-colors ${isSelected ? 'text-[#111]' : 'text-[#111]'}`}>
                            {item.title}
                          </div>
                          <div className="text-[15px] text-text-muted">
                            {item.desc}
                          </div>
                        </div>

                        {/* Animated Check/Arrow indicator */}
                        <div className="ml-auto flex items-center justify-center">
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                            isSelected ? 'bg-accent border-accent text-white scale-100 opacity-100' : 'border-transparent scale-50 opacity-0'
                          }`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {role && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Button 
                        onClick={() => setStep(2)}
                        className="w-full h-14 rounded-[14px] text-lg font-medium bg-accent hover:bg-accent-hover text-white shadow-md flex items-center justify-center gap-2 group"
                      >
                        Continue
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 2: AUTH DETAILS */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVars}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <button 
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-text-muted hover:text-[#111] mb-12 flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft size={16} /> 
                  Back to roles
                </button>

                <div className="mb-12">
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-[#111]">
                    {isLogin ? 'Welcome back' : 'Create account'}
                  </h1>
                  <p className="text-lg text-text-muted">
                    {isLogin ? 'Enter your details to sign in.' : 'Fill in your details to get started.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-semibold text-[#111] mb-2">Full Name</label>
                      <input 
                        placeholder="John Doe" 
                        required 
                        className="w-full h-14 bg-surface border border-border px-4 py-2 text-[#111] rounded-[14px] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-light transition-all placeholder:text-text-muted/50 text-lg" 
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-[#111] mb-2">Email address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      required 
                      className="w-full h-14 bg-surface border border-border px-4 py-2 text-[#111] rounded-[14px] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-light transition-all placeholder:text-text-muted/50 text-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#111] mb-2">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      className="w-full h-14 bg-surface border border-border px-4 py-2 text-[#111] rounded-[14px] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-light transition-all placeholder:text-text-muted/50 text-lg tracking-[0.2em]" 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-[14px] mt-4 text-lg font-medium bg-accent hover:bg-accent-hover text-white shadow-md"
                  >
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>

                  {/* Removed Just browsing around */}
                </form>

                <div className="mt-12 text-center text-[15px] font-medium text-text-muted">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-accent hover:text-accent-hover transition-colors ml-1"
                  >
                    {isLogin ? 'Create one' : 'Sign in'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
