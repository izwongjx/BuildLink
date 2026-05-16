import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, MapPin, Check, MoreHorizontal } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { getProjects, Project, ProjectStatus, clearAllData } from '../../lib/projects';
import HomeownerWizard from '../../components/projects/HomeownerWizard';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  assembling: { label: 'Assembling',  color: '#F59E0B', bg: '#FEF3C7', dot: '#F59E0B' },
  brief_sent:  { label: 'Brief Sent', color: '#2B5CE6', bg: '#EBF0FD', dot: '#2B5CE6' },
  active:      { label: 'Active',     color: '#1A7A4A', bg: '#E8F5EC', dot: '#1A7A4A' },
  completed:   { label: 'Completed',  color: '#888880', bg: '#F0EFEB', dot: '#888880' },
};

// ─── 3D tilt card ────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const status = STATUS_CONFIG[project.status];
  const covered = project.scopeItems.filter(s => s.covered).length;
  const total   = project.scopeItems.length;
  const pct     = total > 0 ? (covered / total) * 100 : 0;
  const pending = project.team.filter(m => m.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.08, duration: 0.5, ease: [0.22,1,0.36,1] } }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.10)', borderColor: '#E8642A' }}
      onClick={onClick}
      className="bg-white border border-[#E4E2DC] rounded-2xl p-7 cursor-pointer transition-all relative overflow-hidden select-none"
      style={{ borderLeft: '4px solid #E8642A', borderRadius: '16px' }}
    >
      {/* Status badge */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[20px] font-black text-[#111] leading-tight pr-2">{project.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ color: status.color, background: status.bg }}>
            {status.label}
          </span>
          <button onClick={e => e.stopPropagation()} className="text-[#888880] hover:text-[#111] p-1 transition-colors">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {project.type && <span className="px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-lg text-[11px] font-semibold text-[#555]">{project.type}</span>}
        {project.location && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-lg text-[11px] font-semibold text-[#555]">
            <MapPin size={10} />{project.location}
          </span>
        )}
        {project.budget && <span className="px-2.5 py-1 bg-[#FDF3EE] rounded-lg text-[11px] font-bold text-[#E8642A]">{project.budget}</span>}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888880]">Coverage</span>
          <span className="text-[12px] font-bold text-[#111]">{covered}/{total}</span>
        </div>
        <div className="h-1 bg-[#F0EFEB] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#E8642A] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%`, transition: { delay: index * 0.08 + 0.3, duration: 0.7, ease: 'easeOut' } }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {project.scopeItems.map(si => (
            <span key={si.id} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
              style={si.covered ? { background:'#FDF3EE', color:'#E8642A' } : { background:'#F0EFEB', color:'#888880' }}>
              {si.covered && <Check size={9} />}{si.service}
            </span>
          ))}
        </div>
      </div>

      {/* Team avatars */}
      {project.team.length > 0 && (
        <div className="flex items-center gap-1 mb-5">
          {project.team.slice(0,5).map((m, i) => (
            <div key={m.profileId}
              className="w-7 h-7 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: m.type==='contractor'?'#2B5CE6':'#1A7A4A', marginLeft: i>0 ? -8 : 0 }}>
              {m.name.charAt(0)}
            </div>
          ))}
          {project.team.length > 5 && <span className="text-[11px] text-[#888880] ml-1">+{project.team.length-5}</span>}
          {pending > 0 && <span className="ml-2 text-[11px] text-amber-600 font-semibold">{pending} pending</span>}
        </div>
      )}

      {/* CTA hint */}
      <p className="text-[12px] font-semibold text-[#888880] flex items-center gap-1 group-hover:text-[#E8642A] transition-colors">
        Open project →
      </p>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomeownerDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isOnboarded = !!localStorage.getItem('buildlink_onboarded_homeowner');

  useEffect(() => {
    const ps = getProjects();
    setProjects(ps);
    setLoaded(true);
    // Auto-open wizard if first time (no projects yet)
    if (ps.length === 0) setWizardOpen(true);
  }, []);

  const handleCreated = (project: Project) => {
    setWizardOpen(false);
    setProjects(getProjects());
    navigate(`/dashboard/homeowner/${project.id}`);
  };

  const name = (() => {
    const d = localStorage.getItem('buildlink_homeowner_data');
    return d ? JSON.parse(d).name : null;
  })();

  const featured = projects[0];
  const rest = projects.slice(1);

  const handleClear = () => {
    if (confirm('Delete all projects and data? This cannot be undone.')) {
      clearAllData();
      setProjects([]);
      setWizardOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <Navbar />

      <div className="pt-32 pb-24 max-w-[1100px] mx-auto px-6">
        {/* Page Header */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
            className="flex items-end justify-between mb-10 pb-6 border-b border-[#E4E2DC]"
          >
            <div>
              <h1 className="text-[32px] font-black text-[#111] tracking-tight mb-1">
                Welcome back{name ? `, ${name}` : ''}.
              </h1>
              <p className="text-[15px] text-[#888880]">Pick up where you left off, or start something new.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClear}
                className="px-4 h-11 border border-[#E4E2DC] text-[#888880] font-bold text-[13px] rounded-full hover:border-red-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
              <motion.button
                onClick={() => setWizardOpen(true)}
                whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(232,100,42,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 h-11 bg-[#E8642A] text-white font-bold text-[14px] rounded-full shadow-sm"
              >
                <Plus size={16} /> New Project
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Projects */}
        <AnimatePresence>
          {loaded && projects.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Featured (full-width) */}
              <ProjectCard project={featured} index={0} onClick={() => navigate(`/dashboard/homeowner/${featured.id}`)} />

              {/* Rest (2-col) */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  {rest.map((p, i) => (
                    <ProjectCard key={p.id} project={p} index={i+1} onClick={() => navigate(`/dashboard/homeowner/${p.id}`)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wizard */}
      <AnimatePresence>
        {wizardOpen && (
          <HomeownerWizard
            onClose={projects.length > 0 ? () => setWizardOpen(false) : undefined}
            disableClose={projects.length === 0}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>

      {/* FAB (when projects exist) */}
      {projects.length > 0 && !wizardOpen && (
        <motion.button
          onClick={() => setWizardOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { delay: 0.5, type: 'spring', stiffness: 300, damping: 24 } }}
          whileHover={{ scale: 1.06, boxShadow: '0 8px 24px rgba(232,100,42,0.35)' }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 h-12 bg-[#E8642A] text-white font-bold text-[14px] rounded-full shadow-lg shadow-[#E8642A]/30"
        >
          <Plus size={18} /> New Project
        </motion.button>
      )}
    </div>
  );
}
