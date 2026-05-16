import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Check, Users, Send, Plus, X, Star, ChevronRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import {
  getProjects, getProject, removeTeamMember, Project, ProjectStatus
} from '../../lib/projects';
import { getContractors, getSuppliers } from '../../lib/db';
import AddToProjectModal from '../../components/projects/AddToProjectModal';
import BriefModal from '../../components/projects/BriefModal';

// ─── Constants ──────────────────────────────────────────────────────────────
const ROLE_COLOR = { contractor: '#2B5CE6', supplier: '#1A7A4A' };
const ROLE_LIGHT = { contractor: '#EBF0FD', supplier: '#E8F5EC' };
const STATUS_DOT: Record<ProjectStatus, string> = {
  assembling:'#F59E0B', brief_sent:'#2B5CE6', active:'#1A7A4A', completed:'#888880'
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E4E2DC] p-5 animate-pulse" style={{ borderLeft:'4px solid #E4E2DC', borderRadius:14 }}>
      <div className="flex gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-[#F0EFEB]" />
        <div className="flex-1">
          <div className="h-4 bg-[#F0EFEB] rounded mb-2 w-3/4" />
          <div className="h-3 bg-[#F0EFEB] rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-3">
        {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-[#F0EFEB] rounded-full" />)}
      </div>
      <div className="h-8 bg-[#F0EFEB] rounded-xl mt-4" />
    </div>
  );
}

// ─── Score Arc ───────────────────────────────────────────────────────────────
function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      <svg width="40" height="40" className="-rotate-90">
        <circle cx="20" cy="20" r={r} stroke="#F0EFEB" strokeWidth="3" fill="none" />
        <motion.circle cx="20" cy="20" r={r} stroke={color} strokeWidth="3" fill="none"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score/100)*circ, transition: { duration: 0.8, ease:'easeOut', delay: 0.2 } }}
        />
      </svg>
      <span className="absolute text-[10px] font-black text-[#111]">{score}%</span>
    </div>
  );
}

// ─── Match Card ──────────────────────────────────────────────────────────────
function MatchCard({ item, type, project, onAdd, featured }: {
  item: any; type: 'contractor'|'supplier'; project: Project;
  onAdd: (item: any, type: 'contractor'|'supplier') => void; featured?: boolean;
}) {
  const navigate = useNavigate();
  const color = ROLE_COLOR[type];
  const light = ROLE_LIGHT[type];
  const initials = item.name.split(' ').map((w:string) => w[0]).join('').slice(0,2).toUpperCase();
  const alreadyAdded = project.team.some(m => String(m.profileId) === String(item.id));
  const isLowMatch = (item.score || 0) === 0;

  const uncovered = project.scopeItems.filter(s => !s.covered).map(s => s.service.toLowerCase());
  const matchingTags = item.tags?.filter((t:string) =>
    uncovered.some(u => u.includes(t.toLowerCase()) || t.toLowerCase().includes(u))
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 12px 36px rgba(0,0,0,0.09)' }}
      transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
      className="bg-white border border-[#E4E2DC] transition-all"
      style={{ borderLeft:`4px solid ${color}`, borderRadius:14 }}
    >
      <div className={`p-5 ${featured ? 'p-7' : ''}`}>
        <div className="flex items-start gap-3 mb-3">
          <div className={`${featured ? 'w-14 h-14' : 'w-11 h-11'} rounded-full flex items-center justify-center font-bold text-white shrink-0`} style={{ background: color }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`${featured ? 'text-[18px]' : 'text-[15px]'} font-bold text-[#111] truncate`}>{item.name}</p>
            <p className="text-[12px] text-[#888880] flex items-center gap-1 mt-0.5"><MapPin size={10} />{item.location}</p>
          </div>
          {isLowMatch ? (
            <span className="px-2.5 py-1 bg-[#F0EFEB] text-[#888880] text-[11px] font-semibold rounded-full shrink-0">Low Match</span>
          ) : (
            <motion.div
              animate={item.score === 100 ? {
                scale: [1, 1.1, 1],
                transition: { delay: 0.5, duration: 0.4 }
              } : {}}
            >
              <ScoreArc score={item.score || 0} color={color} />
            </motion.div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags?.map((t:string) => {
            const isMatch = matchingTags.includes(t);
            return (
              <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={isMatch ? { background:light, color } : { background:'#F7F6F3', color:'#888880' }}>
                {t}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          {[1,2,3].map(i => (
            <div key={i} className="w-2 h-2 rounded-full"
              style={{ background: i <= 2 ? color : '#E4E2DC' }} />
          ))}
          <span className="text-[11px] text-[#888880] ml-1">Mid-Range</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Available Now
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/profile/${type}/${item.id}`)}
              className="px-3 h-8 rounded-lg border border-[#E4E2DC] text-[12px] font-semibold text-[#555] hover:border-[#E8642A] transition-colors"
            >
              View Profile
            </button>
            <motion.button
              onClick={() => !alreadyAdded && onAdd(item, type)}
              disabled={alreadyAdded}
              whileHover={!alreadyAdded ? { scale: 1.02 } : {}}
              whileTap={!alreadyAdded ? { scale: 0.97 } : {}}
              className="px-3 h-8 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all"
              style={alreadyAdded
                ? { background:'#E8F5EC', color:'#1A7A4A' }
                : { background: color, color:'white' }
              }
            >
              {alreadyAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ project, onProjectUpdated }: { project: Project; onProjectUpdated: (p: Project) => void }) {
  const [briefOpen, setBriefOpen] = useState(false);
  const covered = project.scopeItems.filter(s => s.covered).length;
  const total = project.scopeItems.length;
  const pct = total > 0 ? (covered / total) * 100 : 0;
  const allCovered = covered === total && total > 0;

  const handleRemove = (profileId: string) => {
    const updated = removeTeamMember(project.id, profileId);
    if (updated) onProjectUpdated(updated);
  };

  return (
    <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
      {/* Identity */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="bg-white border border-[#E4E2DC] rounded-2xl p-5">
        <h3 className="text-[18px] font-black text-[#111] mb-2">{project.name}</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {project.type && <span className="px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-full text-[11px] font-semibold text-[#555]">{project.type}</span>}
          {project.location && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-full text-[11px] font-semibold text-[#555]">
              <MapPin size={10} />{project.location}
            </span>
          )}
        </div>
        {project.budget && <p className="text-[12px] font-bold text-[#E8642A]">{project.budget}</p>}
        {project.description && <p className="text-[12px] text-[#888880] mt-2 line-clamp-2 leading-relaxed">{project.description}</p>}
      </motion.div>

      {/* Scope checklist */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:0.1 } }}
        className="bg-white border border-[#E4E2DC] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888880]">Services Needed</p>
          <motion.p key={covered} initial={{ scale:0.8 }} animate={{ scale:1 }}
            className="text-[12px] font-bold" style={{ color: covered>0?'#E8642A':'#888880' }}>
            {allCovered ? 'All covered ✓' : `${covered} of ${total}`}
          </motion.p>
        </div>
        <div className="h-1 bg-[#F0EFEB] rounded-full overflow-hidden mb-3">
          <motion.div className="h-full bg-[#E8642A] rounded-full"
            animate={{ width:`${pct}%`, transition:{ type:'spring', stiffness:120, damping:20 } }} />
        </div>
        {project.scopeItems.map((s, i) => (
          <motion.div key={s.id}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0, transition:{ delay:i*0.04 } }}
            className="flex items-center justify-between py-2.5 border-b border-[#F0EFEB] last:border-0"
            style={s.covered ? { background:'#FDFAF8' } : {}}>
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={s.covered ? { backgroundColor:'#E8642A', borderColor:'#E8642A', scale:1 } : { backgroundColor:'transparent', borderColor:'#D4D2CC' }}
                transition={{ type:'spring', stiffness:400, damping:20 }}
                className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0">
                {s.covered && <Check size={10} className="text-white" strokeWidth={3} />}
              </motion.div>
              <span className="text-[13px] font-medium text-[#111]">{s.service}</span>
            </div>
            {s.covered && s.coveredBy ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: ROLE_LIGHT[s.coveredBy.type as keyof typeof ROLE_LIGHT], color: ROLE_COLOR[s.coveredBy.type as keyof typeof ROLE_COLOR] }}>
                {s.coveredBy.name.charAt(0)} <span className="max-w-[72px] truncate">{s.coveredBy.name}</span>
              </span>
            ) : <span className="text-[11px] text-[#888880]">Uncovered</span>}
          </motion.div>
        ))}
        <AnimatePresence>
          {allCovered && (
            <motion.button
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ type:'spring', stiffness:300, damping:26 } }}
              exit={{ opacity:0, y:10 }}
              onClick={() => setBriefOpen(true)}
              className="w-full mt-4 h-11 bg-[#E8642A] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2">
              <Send size={15} /> Send Project Brief →
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Team */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:0.2 } }}
        className={`bg-white rounded-2xl p-5 ${project.team.length===0 ? 'border-2 border-dashed border-[#E4E2DC]' : 'border border-[#E4E2DC]'}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888880]">Your Team</p>
          {project.team.length > 0 && (
            <motion.span initial={{ scale:0 }} animate={{ scale:1, transition:{ type:'spring', stiffness:400, damping:20 } }}
              className="w-5 h-5 bg-[#E8642A] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
              {project.team.length}
            </motion.span>
          )}
        </div>
        {project.team.length === 0 ? (
          <div className="flex flex-col items-center py-5 text-center">
            <Users size={24} className="text-[#D4D2CC] mb-2" />
            <p className="text-[12px] text-[#888880]">Add contractors and suppliers from the right →</p>
          </div>
        ) : (
          <div>
            {project.team.map((m, i) => {
              const color = ROLE_COLOR[m.type as keyof typeof ROLE_COLOR] || '#888';
              const light = ROLE_LIGHT[m.type as keyof typeof ROLE_LIGHT] || '#F0EFEB';
              return (
                <motion.div key={m.profileId}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0, transition:{ delay:i*0.06, type:'spring', stiffness:300, damping:24 } }}
                  className="flex items-start justify-between py-2.5 border-b border-[#F0EFEB] last:border-0 group">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0" style={{ background:color }}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#111]">{m.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.scopesCovered.slice(0,2).map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background:light, color }}>{s}</span>
                        ))}
                        {m.scopesCovered.length > 2 && <span className="text-[10px] text-[#888880]">+{m.scopesCovered.length-2}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(m.profileId)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#888880] hover:text-red-500 p-1">
                    <X size={13} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {briefOpen && (
        <BriefModal project={project} onClose={() => setBriefOpen(false)}
          onSent={p => { onProjectUpdated(p); setBriefOpen(false); }} />
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function HomeownerProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [role, setRole] = useState<'contractors'|'suppliers'>('contractors');
  const [skelLoading, setSkelLoading] = useState(false);
  const [addModal, setAddModal] = useState<{ item: any; type: 'contractor'|'supplier' } | null>(null);
  const prevRole = useRef(role);

  const loadProject = useCallback(() => {
    if (!projectId) return;
    const p = getProject(projectId);
    if (!p) { navigate('/dashboard/homeowner'); return; }
    setProject(p);
  }, [projectId, navigate]);

  useEffect(() => {
    setAllProjects(getProjects());
    setContractors(getContractors());
    setSuppliers(getSuppliers());
    loadProject();
  }, [loadProject]);

  // Skeleton on role switch
  useEffect(() => {
    if (prevRole.current !== role) {
      prevRole.current = role;
      setSkelLoading(true);
      setTimeout(() => setSkelLoading(false), 600);
    }
  }, [role]);

  const score = useCallback((items: any[]) => {
    if (!project) return items;
    const uncovered = project.scopeItems.map(s => s.service.toLowerCase());
    return items.map(item => {
      if (uncovered.length === 0) return { ...item, score: 0 };
      const m = item.tags?.filter((t:string) => uncovered.some(u => u.includes(t.toLowerCase()) || t.toLowerCase().includes(u))).length || 0;
      return { ...item, score: Math.round((m / uncovered.length) * 100) };
    }).sort((a, b) => b.score - a.score);
  }, [project]);

  const scoredList = useMemo(() =>
    score(role === 'contractors' ? contractors : suppliers),
    [role, contractors, suppliers, score]
  );

  const best = scoredList[0];
  const rest = scoredList.slice(1);

  const handleAdded = (updated: Project) => {
    setProject(updated);
    setAllProjects(getProjects());
    setAddModal(null);
  };

  const handleProjectUpdated = (updated: Project) => {
    setProject(updated);
    setAllProjects(getProjects());
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <Navbar />

      <div className="pt-32 pb-20 max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <Sidebar project={project} onProjectUpdated={handleProjectUpdated} />

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[26px] font-black text-[#111] mb-1">Find Your Team</h2>
              <p className="text-[14px] text-[#888880]">Intelligently matched to cover your project scope.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {(['contractors','suppliers'] as const).map(r => (
                <motion.button key={r} onClick={() => setRole(r)}
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  className="px-4 h-9 rounded-full text-[13px] font-bold capitalize transition-all"
                  style={role===r ? { background:'#E8642A', color:'white' } : { background:'#F7F6F3', color:'#888880' }}>
                  {r}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            {skelLoading ? (
              <motion.div key="skel" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
              </motion.div>
            ) : (
              <motion.div key={role} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-10 }} transition={{ duration:0.25 }}>
                {scoredList.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-[#E4E2DC] rounded-2xl">
                    <p className="text-[#888880] font-semibold">No {role} in the system yet.</p>
                    <p className="text-[13px] text-[#888880] mt-1">Register some profiles or use "Populate Demo Data" from a previous session.</p>
                  </div>
                ) : (
                  <>
                    {/* Best Fit */}
                    {best && (
                      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} className="mb-5">
                        <p className="text-[11px] font-bold text-[#E8642A] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                          <Star size={12} className="fill-[#E8642A]" /> Best Fit
                        </p>
                        <MatchCard item={best} type={role==='contractors'?'contractor':'supplier'}
                          project={project} onAdd={(it,t) => setAddModal({item:it,type:t})} featured />
                      </motion.div>
                    )}

                    {/* Rest */}
                    {rest.length > 0 && (
                      <>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880] mb-3">Other Strong Matches</p>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {rest.map((item, i) => (
                            <motion.div key={item.id}
                              initial={{ opacity:0, y:24 }}
                              animate={{ opacity:1, y:0, transition:{ delay:i*0.07 } }}>
                              <MatchCard item={item} type={role==='contractors'?'contractor':'supplier'}
                                project={project} onAdd={(it,t) => setAddModal({item:it,type:t})} />
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addModal && (
          <AddToProjectModal
            profile={{ ...addModal.item, type: addModal.type }}
            project={project}
            onClose={() => setAddModal(null)}
            onAdded={handleAdded}
          />
        )}
        {wizardOpen && (
          <HomeownerWizard onClose={() => setWizardOpen(false)} onCreated={handleWizardCreated} />
        )}
      </AnimatePresence>
    </div>
  );
}
