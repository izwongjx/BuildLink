import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Check, Loader2 } from 'lucide-react';
import { createProject } from '../../lib/projects';

const PROJECT_TYPES = [
  'Home Renovation','Office Fitout','New Build','Kitchen Remodel',
  'Bathroom Upgrade','Commercial Space','Mixed Use','Other',
];
const BUDGETS = ['Under RM5k','RM5k–20k','RM20k–50k','RM50k–150k','RM150k+'];
const TIMELINES = ['ASAP','Within 1 month','1–3 months','3+ months'];
const SERVICES = [
  'General Contracting','Renovation','Carpentry','Flooring','Electrical',
  'Plumbing','Painting','Tiling','Roofing','Glass Works','Steel Works',
  'Interior Fit-Out','Landscaping','Custom Furniture','Other',
];

interface Props {
  onClose?: () => void;
  onCreated: (project: any) => void;
  disableClose?: boolean;
}

const spring = { type: 'spring', stiffness: 320, damping: 28 };

export default function HomeownerWizard({ onClose, onCreated, disableClose }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [projectType, setProjectType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const totalSteps = 5;

  const canProceed: Record<number, boolean> = {
    1: name.trim().length >= 3,
    2: !!projectType && location.trim().length > 0,
    3: !!budget && !!timeline,
    4: services.length >= 1,
    5: true,
  };

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const toggleService = (s: string) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleCreate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const project = createProject({
      name, type: projectType, location, budget, description, scopeServices: services,
    });
    // Backwards compat — keep homeowner_data so old matching engine still works
    localStorage.setItem('buildlink_homeowner_data', JSON.stringify({
      selectedTypes: services,
      selectedBudget: budget,
      selectedTimeline: timeline,
      location,
    }));
    localStorage.setItem('buildlink_onboarded_homeowner', 'true');
    setLoading(false);
    onCreated(project);
  };

  const slideVars = {
    initial: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } },
    exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0, transition: { duration: 0.25 } }),
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="wb"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50"
        onClick={!disableClose ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        key="wm"
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
        exit={{ opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.2 } }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] pointer-events-auto overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-[#F0EFEB] shrink-0">
            <div>
              <h2 className="text-[18px] font-black text-[#111]">
                {step === 1 && 'New Project'}
                {step === 2 && 'Project Type & Location'}
                {step === 3 && 'Budget & Timeline'}
                {step === 4 && 'Services Needed'}
                {step === 5 && 'Anything to add?'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#888880] font-medium">Step {step} of {totalSteps}</span>
              {onClose && !disableClose && (
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F6F3] text-[#888880] transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="h-[3px] bg-[#F0EFEB] shrink-0">
            <motion.div
              className="h-full bg-[#E8642A]"
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-7">
            <AnimatePresence mode="wait" custom={dir}>

              {/* STEP 1 — Name */}
              {step === 1 && (
                <motion.div key="s1" custom={dir} variants={slideVars} initial="initial" animate="animate" exit="exit">
                  <div className="flex flex-col items-center text-center mb-8">
                    <h3 className="text-[22px] font-black text-[#111] mb-2">Give your project a name</h3>
                    <p className="text-[13px] text-[#888880]">e.g. Home Reno 2025, KL Office Fitout, Bangsar Bathroom Upgrade</p>
                  </div>
                  <div className="relative mb-4">
                    <motion.label
                      animate={nameFocused || name ? { y: -22, scale: 0.75, color: '#E8642A' } : { y: 0, scale: 1, color: '#888880' }}
                      className="absolute left-4 top-4 text-[15px] font-medium pointer-events-none origin-left"
                    >
                      Project name
                    </motion.label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      className="w-full h-16 px-4 pt-5 bg-[#F7F6F3] border-2 border-transparent rounded-xl text-[20px] font-semibold text-[#111] focus:outline-none focus:border-[#E8642A] focus:bg-white transition-all"
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Type & Location */}
              {step === 2 && (
                <motion.div key="s2" custom={dir} variants={slideVars} initial="initial" animate="animate" exit="exit">
                  <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888880] mb-3">Project Type</p>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map(t => (
                        <button
                          key={t}
                          onClick={() => setProjectType(t)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border-2 transition-all"
                          style={projectType === t
                            ? { background: '#E8642A', color: 'white', borderColor: '#E8642A' }
                            : { background: '#F7F6F3', color: '#555', borderColor: 'transparent' }
                          }
                        >
                          {projectType === t && <Check size={12} />}{t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888880] mb-2">Location</p>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888880]" />
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="State / City"
                        className="w-full h-12 pl-10 pr-4 bg-[#F7F6F3] border-2 border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#E8642A] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Budget & Timeline */}
              {step === 3 && (
                <motion.div key="s3" custom={dir} variants={slideVars} initial="initial" animate="animate" exit="exit">
                  <div className="mb-7">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888880] mb-3">Budget Range</p>
                    <div className="flex flex-wrap gap-2">
                      {BUDGETS.map(b => (
                        <motion.button
                          key={b}
                          onClick={() => setBudget(b)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative px-4 py-2.5 rounded-xl text-[12px] font-semibold border-2 transition-all"
                          style={budget === b
                            ? { borderColor: '#E8642A', background: '#FDF3EE', color: '#E8642A' }
                            : { borderColor: '#E4E2DC', color: '#555' }
                          }
                        >
                          {budget === b && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E8642A] rounded-full flex items-center justify-center">
                              <Check size={9} className="text-white" />
                            </span>
                          )}
                          {b}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888880] mb-3">Timeline</p>
                    <div className="flex flex-wrap gap-2">
                      {TIMELINES.map(t => (
                        <motion.button
                          key={t}
                          onClick={() => setTimeline(t)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative px-4 py-2.5 rounded-xl text-[12px] font-semibold border-2 transition-all"
                          style={timeline === t
                            ? { borderColor: '#E8642A', background: '#FDF3EE', color: '#E8642A' }
                            : { borderColor: '#E4E2DC', color: '#555' }
                          }
                        >
                          {timeline === t && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E8642A] rounded-full flex items-center justify-center">
                              <Check size={9} className="text-white" />
                            </span>
                          )}
                          {t}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Services */}
              {step === 4 && (
                <motion.div key="s4" custom={dir} variants={slideVars} initial="initial" animate="animate" exit="exit">
                  <h3 className="text-[18px] font-bold text-[#111] mb-1">What does this project need?</h3>
                  <p className="text-[13px] text-[#888880] mb-5">Select all services required. We'll match contractors and suppliers to cover each one.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {SERVICES.map((s, i) => {
                      const sel = services.includes(s);
                      return (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.025 } }}
                          onClick={() => toggleService(s)}
                          whileTap={sel ? { scale: 1 } : { scale: [1, 1.08, 1.04] }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border-2 transition-all"
                          style={sel
                            ? { background: '#E8642A', color: 'white', borderColor: '#E8642A' }
                            : { background: '#F7F6F3', color: '#555', borderColor: 'transparent' }
                          }
                        >
                          {sel && <Check size={12} />}{s}
                        </motion.button>
                      );
                    })}
                  </div>
                  <motion.p layout className="text-[13px] text-[#888880]">
                    <motion.span key={services.length} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-black text-[#111] mr-1">
                      {services.length}
                    </motion.span>
                    service{services.length !== 1 ? 's' : ''} selected
                  </motion.p>
                </motion.div>
              )}

              {/* STEP 5 — Description */}
              {step === 5 && (
                <motion.div key="s5" custom={dir} variants={slideVars} initial="initial" animate="animate" exit="exit">
                  <h3 className="text-[18px] font-bold text-[#111] mb-2">Anything else to add?</h3>
                  <p className="text-[13px] text-[#888880] mb-5">Describe your project briefly — materials, style, special requirements...</p>
                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      maxLength={300}
                      rows={4}
                      placeholder="Optional — your brief will help us match you better."
                      className="w-full px-4 py-3 bg-[#F7F6F3] border-2 border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#E8642A] focus:bg-white transition-all resize-none"
                    />
                    <span className="absolute bottom-3 right-4 text-[11px] text-[#888880]">{description.length}/300</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[#F0EFEB] flex items-center justify-between shrink-0">
            {step > 1 ? (
              <motion.button
                onClick={() => go(step - 1)}
                whileHover={{ x: -2 }}
                className="text-[14px] font-semibold text-[#888880] hover:text-[#111] transition-colors"
              >
                ← Back
              </motion.button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {step === 5 && (
                <button
                  onClick={() => { setDescription(''); handleCreate(); }}
                  className="text-[13px] font-semibold text-[#888880] hover:text-[#111] transition-colors"
                >
                  Skip
                </button>
              )}
              <motion.button
                onClick={step < totalSteps ? () => go(step + 1) : handleCreate}
                disabled={!canProceed[step] || loading}
                whileHover={canProceed[step] && !loading ? { y: -1 } : {}}
                whileTap={canProceed[step] && !loading ? { scale: 0.97 } : {}}
                className="flex items-center gap-2 px-7 h-11 rounded-xl text-[14px] font-bold transition-all duration-300"
                style={canProceed[step] && !loading
                  ? { background: '#E8642A', color: 'white' }
                  : { background: '#E4E2DC', color: '#888880', cursor: 'not-allowed' }
                }
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating...</>
                ) : step < totalSteps ? (
                  'Continue →'
                ) : (
                  'Create Project →'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
