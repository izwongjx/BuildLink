import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, MapPin } from 'lucide-react';
import { Project, addTeamMember, MemberType } from '../../lib/projects';

interface Props {
  profile: {
    id: string | number;
    name: string;
    type: MemberType;
    tags: string[];
    location?: string;
    rating?: number;
  };
  project: Project;
  onClose: () => void;
  onAdded: (updatedProject: Project) => void;
}

const spring = { type: 'spring', stiffness: 320, damping: 28 };
const roleColor = { contractor: '#2B5CE6', supplier: '#1A7A4A' };

export default function AddToProjectModal({ profile, project, onClose, onAdded }: Props) {
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const uncoveredScopes = project.scopeItems.filter(s => !s.covered);
  const coveredScopes = project.scopeItems.filter(s => s.covered);

  // Scopes relevant to this contractor/supplier based on their tags
  const relevantScopes = uncoveredScopes.filter(si =>
    profile.tags.some(tag =>
      tag.toLowerCase().includes(si.service.toLowerCase()) ||
      si.service.toLowerCase().includes(tag.toLowerCase())
    )
  );
  const otherUncovered = uncoveredScopes.filter(si => !relevantScopes.find(r => r.id === si.id));
  const allSelectable = [...relevantScopes, ...otherUncovered];

  const allFullyCovered = uncoveredScopes.length === 0;

  const toggle = (service: string) => {
    setSelectedScopes(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
  };

  const handleAdd = async () => {
    if (selectedScopes.length === 0 && !allFullyCovered) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const updated = addTeamMember(
      project.id,
      {
        type: profile.type,
        profileId: String(profile.id),
        name: profile.name,
        scopesCovered: selectedScopes,
      },
      []
    );
    setLoading(false);
    if (updated) onAdded(updated);
  };

  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color = roleColor[profile.type];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

          {/* Header */}
          <div className="px-8 py-6 border-b border-[#F0EFEB]">
            <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F6F3] text-[#888880] transition-colors">
              <X size={18} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-white shrink-0" style={{ background: color }}>
                {initials}
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[#111]">{profile.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white capitalize" style={{ background: color }}>
                    {profile.type}
                  </span>
                  {profile.location && (
                    <span className="text-[12px] text-[#888880] flex items-center gap-1">
                      <MapPin size={11} /> {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6 max-h-[420px] overflow-y-auto">
            {allFullyCovered ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check size={20} className="text-green-700" />
                </div>
                <p className="text-[15px] font-bold text-[#111] mb-1">Scope fully covered!</p>
                <p className="text-[13px] text-[#888880]">You can still add {profile.name} as backup.</p>
                <textarea
                  placeholder="Add a note (optional)..."
                  className="mt-4 w-full px-4 py-3 bg-[#F7F6F3] rounded-xl text-[13px] text-[#111] border border-transparent focus:border-[#E8642A] focus:outline-none transition-all resize-none"
                  rows={3}
                />
              </div>
            ) : (
              <>
                <p className="text-[14px] font-semibold text-[#111] mb-4">
                  What will <span className="text-[#E8642A]">{profile.name}</span> handle on this project?
                </p>

                {allSelectable.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {relevantScopes.length > 0 && (
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880] mb-2">Matching Services</p>
                    )}
                    {relevantScopes.map((si, i) => (
                      <motion.button
                        key={si.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                        onClick={() => toggle(si.service)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          selectedScopes.includes(si.service)
                            ? 'border-[#E8642A] bg-[#FDF3EE]'
                            : 'border-[#E4E2DC] hover:border-[#E8642A]/40'
                        }`}
                      >
                        <span className="text-[14px] font-semibold text-[#111]">{si.service}</span>
                        <motion.div
                          animate={selectedScopes.includes(si.service)
                            ? { scale: 1, backgroundColor: '#E8642A' }
                            : { scale: 1, backgroundColor: '#E4E2DC' }
                          }
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        >
                          {selectedScopes.includes(si.service) && <Check size={11} className="text-white" />}
                        </motion.div>
                      </motion.button>
                    ))}

                    {otherUncovered.length > 0 && (
                      <>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880] mt-4 mb-2">Other Uncovered Services</p>
                        {otherUncovered.map((si, i) => (
                          <motion.button
                            key={si.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: (relevantScopes.length + i) * 0.04 } }}
                            onClick={() => toggle(si.service)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                              selectedScopes.includes(si.service)
                                ? 'border-[#E8642A] bg-[#FDF3EE]'
                                : 'border-[#E4E2DC] hover:border-[#E8642A]/40'
                            }`}
                          >
                            <span className="text-[14px] font-semibold text-[#111]">{si.service}</span>
                            <motion.div
                              animate={selectedScopes.includes(si.service)
                                ? { scale: 1, backgroundColor: '#E8642A' }
                                : { scale: 1, backgroundColor: '#E4E2DC' }
                              }
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            >
                              {selectedScopes.includes(si.service) && <Check size={11} className="text-white" />}
                            </motion.div>
                          </motion.button>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* Already Covered */}
                {coveredScopes.length > 0 && (
                  <div className="opacity-40 mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880] mb-2">Already Covered</p>
                    {coveredScopes.map(si => (
                      <div key={si.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F7F6F3] mb-2 cursor-not-allowed">
                        <span className="text-[13px] text-[#555]">{si.service}</span>
                        <span className="text-[11px] text-[#888880]">{si.coveredBy?.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-[#F0EFEB]">
            <motion.button
              onClick={handleAdd}
              disabled={(selectedScopes.length === 0 && !allFullyCovered) || loading}
              whileHover={(selectedScopes.length > 0 || allFullyCovered) && !loading ? { y: -1 } : {}}
              whileTap={(selectedScopes.length > 0 || allFullyCovered) && !loading ? { scale: 0.97 } : {}}
              className={`w-full h-12 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                (selectedScopes.length > 0 || allFullyCovered) && !loading
                  ? 'bg-[#E8642A] text-white shadow-sm'
                  : 'bg-[#E4E2DC] text-[#888880] cursor-not-allowed'
              }`}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Adding...</>
              ) : allFullyCovered ? (
                'Add as Backup'
              ) : (
                `Add to Project${selectedScopes.length > 0 ? ` (${selectedScopes.length})` : ''}`
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
