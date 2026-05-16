import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Edit3, Check, Users, Plus, X, Send, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Project, updateProject, removeTeamMember, addTeamMember, getContractors, getSuppliers } from '../../lib/projects';
import AddToProjectModal from './AddToProjectModal';
import BriefModal from './BriefModal';

const roleColor = { contractor: '#2B5CE6', supplier: '#1A7A4A' };
const roleLight = { contractor: '#EBF0FD', supplier: '#E8F5EC' };

interface Props {
  project: Project;
  onProjectUpdated: (p: Project) => void;
}

// ─── Score Arc SVG ─────────────────────────────────────────────────────────────
function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg width="40" height="40" className="-rotate-90">
        <circle cx="20" cy="20" r={r} stroke="#F0EFEB" strokeWidth="3" fill="none" />
        <motion.circle
          cx="20" cy="20" r={r} stroke={color} strokeWidth="3" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } }}
        />
      </svg>
      <span className="absolute text-[11px] font-black text-[#111]">{score}%</span>
    </div>
  );
}

// ─── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ item, type, project, onAdd }: {
  item: any; type: 'contractor' | 'supplier'; project: Project; onAdd: (item: any, type: 'contractor'|'supplier') => void;
}) {
  const prefersReduced = useReducedMotion();
  const navigate = useNavigate();
  const [addState, setAddState] = useState<'idle' | 'loading' | 'added'>('idle');
  const color = roleColor[type];
  const light = roleLight[type];
  const initials = item.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const alreadyAdded = project.team.some(m => String(m.profileId) === String(item.id));

  // Tags that match project uncovered scopes
  const matchingTags = useMemo(() => {
    const uncovered = project.scopeItems.filter(s => !s.covered).map(s => s.service.toLowerCase());
    return item.tags?.filter((t: string) => uncovered.some(u => u.includes(t.toLowerCase()) || t.toLowerCase().includes(u)));
  }, [item.tags, project.scopeItems]);

  useEffect(() => {
    if (alreadyAdded) setAddState('added');
  }, [alreadyAdded]);

  const handleClick = async () => {
    if (addState !== 'idle') return;
    onAdd(item, type);
  };

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReduced ? {} : { y: -2 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border border-[#E4E2DC] overflow-hidden hover:border-[#E8642A]/30 hover:shadow-lg transition-all"
      style={{ borderLeft: `4px solid ${color}`, borderRadius: '14px' }}
    >
      <div className="p-5 pb-4">
        {/* Top Row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0" style={{ background: color }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#111] truncate">{item.name}</p>
            <p className="text-[12px] text-[#888880] flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {item.location}
            </p>
          </div>
          <ScoreArc score={item.score || 0} color={color} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags?.map((t: string) => {
            const isMatch = matchingTags?.includes(t);
            return (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
                style={isMatch
                  ? { background: light, color }
                  : { background: '#F7F6F3', color: '#888880' }
                }
              >
                {t}
              </span>
            );
          })}
        </div>

        {/* Price dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {['Budget','Mid-Range','Premium'].map((tier, i) => {
            const levels = { Budget: 1, 'Mid-Range': 2, Premium: 3 };
            const filled = i < (levels[item.price as keyof typeof levels] || 2);
            return (
              <div key={tier} className="w-2 h-2 rounded-full transition-colors" style={{ background: filled ? color : '#E4E2DC' }} />
            );
          })}
          <span className="text-[11px] text-[#888880] ml-1">{item.price || 'Mid-Range'}</span>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Available Now
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/profile/${type}/${item.id}`)}
              className="px-3 h-8 rounded-lg border border-[#E4E2DC] text-[12px] font-semibold text-[#555] hover:border-[#E8642A] transition-colors"
            >
              View Profile
            </button>
            <motion.button
              onClick={handleClick}
              whileHover={addState === 'idle' ? { scale: 1.02 } : {}}
              whileTap={addState === 'idle' ? { scale: 0.97 } : {}}
              disabled={addState !== 'idle'}
              className="px-3 h-8 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all"
              style={
                addState === 'added'
                  ? { background: '#E8F5EC', color: '#1A7A4A' }
                  : { background: color, color: 'white' }
              }
            >
              {addState === 'idle' && <><Plus size={12} /> Add to Project</>}
              {addState === 'loading' && <span className="animate-spin">⟳</span>}
              {addState === 'added' && <><Check size={12} /> Added</>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Scope Row ─────────────────────────────────────────────────────────────────
function ScopeRow({ scope, index }: { scope: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0, transition: { delay: index * 0.04 } }}
      className="flex items-center justify-between py-3 border-b border-[#F0EFEB] last:border-0 transition-colors"
      style={scope.covered ? { background: '#FDFAF8' } : {}}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={scope.covered
            ? { scale: 1, backgroundColor: '#E8642A', borderColor: '#E8642A' }
            : { scale: 1, backgroundColor: 'transparent', borderColor: '#D4D2CC' }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0"
        >
          {scope.covered && <Check size={10} className="text-white" strokeWidth={3} />}
        </motion.div>
        <span className="text-[14px] font-medium text-[#111]">{scope.service}</span>
      </div>
      {scope.covered && scope.coveredBy ? (
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            background: roleLight[scope.coveredBy.type as keyof typeof roleLight],
            color: roleColor[scope.coveredBy.type as keyof typeof roleColor],
          }}
        >
          {scope.coveredBy.name.charAt(0)}
          <span className="max-w-[80px] truncate">{scope.coveredBy.name}</span>
        </span>
      ) : (
        <span className="text-[11px] text-[#888880]">Uncovered</span>
      )}
    </motion.div>
  );
}

// ─── Team Member Row ───────────────────────────────────────────────────────────
function TeamRow({ member, onRemove, index }: { member: any; onRemove: () => void; index: number }) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const color = roleColor[member.type as keyof typeof roleColor] || '#888880';
  const light = roleLight[member.type as keyof typeof roleLight] || '#F0EFEB';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { delay: index * 0.06, type: 'spring', stiffness: 300, damping: 24 } }}
      className="flex items-start justify-between py-3 border-b border-[#F0EFEB] last:border-0 group"
    >
      <div className="flex items-start gap-2 min-w-0">
        <div className="w-8 h-8 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0" style={{ background: color }}>
          {member.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#111]">{member.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {member.scopesCovered.slice(0, 3).map((s: string) => (
              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: light, color }}>
                {s}
              </span>
            ))}
            {member.scopesCovered.length > 3 && (
              <span className="text-[10px] text-[#888880]">+{member.scopesCovered.length - 3}</span>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 ml-2">
        {confirmRemove ? (
          <div className="flex items-center gap-1.5">
            <button onClick={onRemove} className="text-[11px] text-red-600 font-bold hover:underline">Confirm</button>
            <button onClick={() => setConfirmRemove(false)} className="text-[11px] text-[#888880] font-bold hover:underline">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmRemove(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#888880] hover:text-red-500"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Assembly View ────────────────────────────────────────────────────────
export default function ProjectAssemblyView({ project: initialProject, onProjectUpdated }: Props) {
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState<'contractors' | 'suppliers'>('contractors');
  const [contractors, setContractors] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [addModal, setAddModal] = useState<{ item: any; type: 'contractor'|'supplier' } | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { setProject(initialProject); }, [initialProject]);

  useEffect(() => {
    setContractors(getContractors());
    setSuppliers(getSuppliers());
  }, []);

  const coveredCount = project.scopeItems.filter(s => s.covered).length;
  const totalCount = project.scopeItems.length;
  const allCovered = coveredCount === totalCount && totalCount > 0;
  const progressPct = totalCount > 0 ? (coveredCount / totalCount) * 100 : 0;

  const handleAdded = useCallback((updated: Project) => {
    setProject(updated);
    onProjectUpdated(updated);
    setAddModal(null);
    const member = updated.team[updated.team.length - 1];
    const covered = updated.scopeItems.filter(s => s.covered).length;
    showToast(`${member?.name} added — ${covered} service${covered !== 1 ? 's' : ''} now covered ✓`);
  }, [onProjectUpdated]);

  const handleRemove = useCallback((profileId: string) => {
    const updated = removeTeamMember(project.id, profileId);
    if (updated) { setProject(updated); onProjectUpdated(updated); }
  }, [project.id, onProjectUpdated]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleBriefSent = (updated: Project) => {
    setProject(updated);
    onProjectUpdated(updated);
    setBriefOpen(false);
  };

  // Score matches against uncovered scopes
  const scoreItems = useCallback((items: any[]) => {
    const uncovered = project.scopeItems.filter(s => !s.covered).map(s => s.service.toLowerCase());
    return items.map(item => {
      if (uncovered.length === 0) return { ...item, score: 0 };
      const matches = item.tags?.filter((t: string) => uncovered.some(u => u.includes(t.toLowerCase()) || t.toLowerCase().includes(u))).length || 0;
      return { ...item, score: Math.round((matches / Math.max(uncovered.length, 1)) * 100) };
    }).sort((a, b) => b.score - a.score);
  }, [project.scopeItems]);

  const scoredContractors = useMemo(() => scoreItems(contractors), [contractors, scoreItems]);
  const scoredSuppliers = useMemo(() => scoreItems(suppliers), [suppliers, scoreItems]);
  const displayList = activeTab === 'contractors' ? scoredContractors : scoredSuppliers;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-0">

      {/* ── LEFT SIDEBAR ────────────────────────────────────── */}
      <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-5">

        {/* Project Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E4E2DC] rounded-2xl p-6 relative"
        >
          <button className="absolute top-4 right-4 text-[#888880] hover:text-[#111] transition-all hover:rotate-15 duration-200">
            <Edit3 size={15} />
          </button>
          <h3 className="text-[20px] font-black text-[#111] truncate mb-2">{project.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-full text-[11px] font-semibold text-[#555]">
              {project.type}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-full text-[11px] font-semibold text-[#555]">
              <MapPin size={10} /> {project.location || 'No location'}
            </span>
          </div>
          {project.budget && (
            <p className="text-[12px] font-bold text-[#E8642A] mt-3">{project.budget}</p>
          )}
        </motion.div>

        {/* Scope Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888880]">Services Needed</p>
            <motion.p
              key={coveredCount}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[13px] font-bold"
              style={{ color: coveredCount > 0 ? '#E8642A' : '#888880' }}
            >
              {coveredCount} of {totalCount} covered
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-[#F0EFEB] rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-[#E8642A] rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
          </div>

          {/* Scope items */}
          <div>
            {project.scopeItems.map((s, i) => (
              <ScopeRow key={s.id} scope={s} index={i} />
            ))}
          </div>

          {/* Send brief CTA when all covered */}
          <AnimatePresence>
            {allCovered && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => setBriefOpen(true)}
                className="w-full mt-5 h-12 bg-[#E8642A] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#d4571f] transition-colors"
              >
                <Send size={16} /> Send Project Brief →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Team Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className={`bg-white rounded-2xl p-6 transition-all ${
            project.team.length === 0
              ? 'border-2 border-dashed border-[#E4E2DC]'
              : 'border border-[#E4E2DC]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888880]">Your Team</p>
            {project.team.length > 0 && (
              <span className="w-5 h-5 bg-[#F0EFEB] rounded-full text-[11px] font-bold text-[#555] flex items-center justify-center">
                {project.team.length}
              </span>
            )}
          </div>

          {project.team.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Users size={28} className="text-[#D4D2CC] mb-2" />
              <p className="text-[13px] text-[#888880]">Add contractors and suppliers below</p>
            </div>
          ) : (
            <div>
              {project.team.map((m, i) => (
                <TeamRow key={m.profileId} member={m} index={i} onRemove={() => handleRemove(m.profileId)} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Section Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-black text-[#111] mb-1">Find Your Team</h2>
            <p className="text-[14px] text-[#888880]">Adding matches will cover your scope checklist</p>
          </div>
          {/* Tab pills */}
          <div className="flex gap-2 shrink-0">
            {(['contractors', 'suppliers'] as const).map(tab => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 h-9 rounded-full text-[13px] font-bold capitalize transition-all"
                style={activeTab === tab
                  ? { background: '#E8642A', color: 'white' }
                  : { background: '#F7F6F3', color: '#888880' }
                }
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-4"
          >
            {displayList.length > 0 ? (
              displayList.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}
                >
                  <MatchCard
                    item={item}
                    type={activeTab === 'contractors' ? 'contractor' : 'supplier'}
                    project={project}
                    onAdd={(it, type) => setAddModal({ item: it, type })}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-20 text-center border-2 border-dashed border-[#E4E2DC] rounded-2xl">
                <p className="text-[#888880] font-semibold">No {activeTab} in the marketplace yet.</p>
                <p className="text-[13px] text-[#888880] mt-1">Populate demo data or register new profiles.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {addModal && (
          <AddToProjectModal
            profile={{ ...addModal.item, type: addModal.type }}
            project={project}
            onClose={() => setAddModal(null)}
            onAdded={handleAdded}
          />
        )}
      </AnimatePresence>

      {/* Brief Modal */}
      <AnimatePresence>
        {briefOpen && (
          <BriefModal project={project} onClose={() => setBriefOpen(false)} onSent={handleBriefSent} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111] text-white px-6 py-3 rounded-full text-[14px] font-semibold shadow-2xl z-50 flex items-center gap-2"
          >
            <Check size={16} className="text-green-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
