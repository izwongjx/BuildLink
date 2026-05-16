import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Check, Plus, Loader2 } from 'lucide-react';
import { createProject } from '../../lib/projects';

const PROJECT_TYPES = [
  'Home Renovation','Office Fitout','New Build','Kitchen Remodel',
  'Bathroom Upgrade','Commercial Space','Mixed Use','Other',
];

const BUDGETS = ['Under RM5k','RM5k–20k','RM20k–50k','RM50k–150k','RM150k+'];

const SCOPE_SERVICES = [
  'General Contracting','Renovation','Carpentry','Flooring','Electrical',
  'Plumbing','Painting','Tiling','Roofing','Glass Works','Steel Works',
  'Interior Fit-Out','Landscaping','Custom Furniture','Other',
];

interface Props {
  onClose: () => void;
  onCreated: (project: any) => void;
}

const spring = { type: 'spring', stiffness: 320, damping: 28 };

export default function CreateProjectModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);

  const [nameFocused, setNameFocused] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const canContinue = name.trim() && type;
  const canCreate = scopes.length > 0;

  const go = (nextStep: number) => {
    setDir(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const toggleScope = (s: string) => {
    setScopes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const project = createProject({ name, type, location, budget, description, scopeServices: scopes });
    setLoading(false);
    onCreated(project);
  };

  const slideVars = {
    initial: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.25 } }),
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
        exit={{ opacity: 0, y: 30, scale: 0.97, transition: { duration: 0.2 } }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#F0EFEB]">
            <h2 className="text-xl font-bold text-[#111]">New Project</h2>
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-[#888880]">Step {step} of 2</span>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F6F3] transition-colors text-[#888880] hover:text-[#111]">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1 bg-[#F0EFEB]">
            <motion.div
              className="h-full bg-[#E8642A]"
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
            />
          </div>

          {/* Steps */}
          <div className="px-8 py-8 overflow-y-auto flex-1">
            <AnimatePresence mode="wait" custom={dir}>
              {step === 1 && (
                <motion.div key="step1" custom={dir} variants={slideVars} initial="initial" animate="animate" exit="exit">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888880] mb-6">Project Details</p>

                  {/* Project Name — float label */}
                  <div className="relative mb-6">
                    <motion.label
                      animate={nameFocused || name ? { y: -22, scale: 0.8, color: '#E8642A' } : { y: 0, scale: 1, color: '#888880' }}
                      className="absolute left-4 top-4 text-[15px] font-medium pointer-events-none origin-left"
                    >
                      Project Name
                    </motion.label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      placeholder={nameFocused ? 'e.g. KL Office Fitout 2025' : ''}
                      className="w-full h-14 px-4 pt-4 bg-[#F7F6F3] border border-transparent rounded-xl text-[17px] font-medium text-[#111] focus:outline-none focus:border-[#E8642A] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Project Type */}
                  <div className="mb-6">
                    <p className="text-[12px] font-bold text-[#888880] mb-3">Project Type</p>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map(t => (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                            type === t
                              ? 'bg-[#E8642A] text-white border-[#E8642A]'
                              : 'bg-[#F7F6F3] border-transparent text-[#555] hover:border-[#E8642A]/30'
                          }`}
                        >
                          {type === t && <Check size={12} />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-6">
                    <p className="text-[12px] font-bold text-[#888880] mb-2">Location</p>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888880]" />
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Kuala Lumpur, Malaysia"
                        className="w-full h-12 pl-10 pr-4 bg-[#F7F6F3] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#E8642A] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="mb-6">
                    <p className="text-[12px] font-bold text-[#888880] mb-3">Budget Range</p>
                    <div className="flex gap-2 flex-wrap">
                      {BUDGETS.map(b => (
                        <motion.button
                          key={b}
                          onClick={() => setBudget(b)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-4 py-2.5 rounded-xl text-[12px] font-semibold border-2 transition-all ${
                            budget === b
                              ? 'border-[#E8642A] bg-[#FDF3EE] text-[#E8642A]'
                              : 'border-[#E4E2DC] text-[#555] hover:border-[#E8642A]/40'
                          }`}
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

                  {/* Description */}
                  <div className="mb-2">
                    <p className="text-[12px] font-bold text-[#888880] mb-2">Description</p>
                    <div className="relative">
                      <textarea
                        ref={descRef}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={300}
                        rows={3}
                        placeholder="Brief overview of what you want to achieve..."
                        className="w-full px-4 py-3 bg-[#F7F6F3] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#E8642A] focus:bg-white transition-all resize-none"
                      />
                      <span className="absolute bottom-2 right-3 text-[11px] text-[#888880]">{description.length}/300</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" custom={dir} variants={slideVars} initial="initial" animate="animate" exit="exit">
                  <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[18px] font-bold text-[#111] mb-2">
                    What does this project need?
                  </motion.h3>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="text-[14px] text-[#888880] mb-6">
                    Select all services required. We'll track coverage as you build your team.
                  </motion.p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {SCOPE_SERVICES.map((s, i) => {
                      const selected = scopes.includes(s);
                      return (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                          onClick={() => toggleScope(s)}
                          whileTap={selected ? { scale: 1 } : { scale: [1, 1.08, 1.04] }}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                            selected
                              ? 'bg-[#E8642A] text-white border-[#E8642A] shadow-sm'
                              : 'bg-[#F7F6F3] border-transparent text-[#555] hover:border-[#E8642A]/30'
                          }`}
                        >
                          {selected && <Check size={12} />}
                          {s}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Count */}
                  <motion.p layout className="text-[13px] text-[#888880] font-medium">
                    <motion.span key={scopes.length} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-black text-[#111]">
                      {scopes.length}
                    </motion.span>
                    {' '}service{scopes.length !== 1 ? 's' : ''} selected
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-[#F0EFEB] flex items-center justify-between">
            {step === 2 ? (
              <motion.button
                onClick={() => go(1)}
                className="text-[14px] font-semibold text-[#888880] hover:text-[#111] transition-colors"
                whileHover={{ x: -2 }}
              >
                ← Back
              </motion.button>
            ) : <div />}

            {step === 1 ? (
              <motion.button
                onClick={() => go(2)}
                disabled={!canContinue}
                whileHover={canContinue ? { y: -1 } : {}}
                whileTap={canContinue ? { scale: 0.97 } : {}}
                className={`px-8 h-12 rounded-xl text-[14px] font-bold transition-all duration-300 ${
                  canContinue
                    ? 'bg-[#E8642A] text-white shadow-sm shadow-[#E8642A]/20 hover:bg-[#d4571f]'
                    : 'bg-[#E4E2DC] text-[#888880] cursor-not-allowed'
                }`}
              >
                Continue →
              </motion.button>
            ) : (
              <motion.button
                onClick={handleCreate}
                disabled={!canCreate || loading}
                whileHover={canCreate && !loading ? { y: -1 } : {}}
                whileTap={canCreate && !loading ? { scale: 0.97 } : {}}
                className={`flex items-center gap-2 px-8 h-12 rounded-xl text-[14px] font-bold transition-all duration-300 ${
                  canCreate && !loading
                    ? 'bg-[#E8642A] text-white shadow-sm shadow-[#E8642A]/20 hover:bg-[#d4571f]'
                    : 'bg-[#E4E2DC] text-[#888880] cursor-not-allowed'
                }`}
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Project →'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
