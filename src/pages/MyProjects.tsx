import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, MapPin, Users, ArrowRight, MoreHorizontal, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getProjects, Project, ProjectStatus } from '../lib/projects';
import CreateProjectModal from '../components/projects/CreateProjectModal';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  assembling: { label: 'Assembling', color: '#F59E0B', bg: '#FEF3C7' },
  brief_sent:  { label: 'Brief Sent', color: '#2B5CE6', bg: '#EBF0FD' },
  active:      { label: 'Active',     color: '#1A7A4A', bg: '#E8F5EC' },
  completed:   { label: 'Completed',  color: '#888880', bg: '#F0EFEB' },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function ProjectCard({ project, featured, index, onOpen }: {
  project: Project; featured?: boolean; index: number; onOpen: (id: string) => void;
}) {
  const covered = project.scopeItems.filter(s => s.covered).length;
  const total = project.scopeItems.length;
  const pct = total > 0 ? (covered / total) * 100 : 0;
  const accepted = project.team.filter(m => m.status === 'accepted').length;
  const pending = project.team.filter(m => m.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      viewport={{ once: true }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      className="bg-white border border-[#E4E2DC] rounded-2xl p-7 relative overflow-hidden cursor-pointer transition-all"
      style={{ borderLeft: '4px solid #E8642A', borderRadius: '14px' }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className={`font-black text-[#111] ${featured ? 'text-[22px]' : 'text-[18px]'} leading-tight`}>{project.name}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={project.status} />
          <button className="text-[#888880] hover:text-[#111] transition-colors p-1"><MoreHorizontal size={16} /></button>
        </div>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {project.type && (
          <span className="px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-lg text-[11px] font-semibold text-[#555]">{project.type}</span>
        )}
        {project.location && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-lg text-[11px] font-semibold text-[#555]">
            <MapPin size={10} /> {project.location}
          </span>
        )}
        {project.budget && (
          <span className="px-2.5 py-1 bg-[#FDF3EE] rounded-lg text-[11px] font-bold text-[#E8642A]">{project.budget}</span>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880]">Services Covered</span>
          <span className="text-[12px] font-bold text-[#111]">{covered} of {total}</span>
        </div>
        <div className="h-1 bg-[#F0EFEB] rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-[#E8642A] rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%`, transition: { duration: 0.8, ease: 'easeOut', delay: index * 0.1 + 0.3 } }}
            viewport={{ once: true }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.scopeItems.map(si => (
            <span
              key={si.id}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
              style={si.covered
                ? { background: '#FDF3EE', color: '#E8642A' }
                : { background: '#F0EFEB', color: '#888880', outline: '1px solid #E4E2DC' }
              }
            >
              {si.covered && <Check size={9} />}
              {si.service}
            </span>
          ))}
        </div>
      </div>

      {/* Team */}
      {project.team.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-1 mb-1">
            {project.team.slice(0, 5).map((m, i) => (
              <div
                key={m.profileId}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: m.type === 'contractor' ? '#2B5CE6' : '#1A7A4A', marginLeft: i > 0 ? -8 : 0 }}
              >
                {m.name.charAt(0)}
              </div>
            ))}
            {project.team.length > 5 && (
              <span className="text-[11px] text-[#888880] ml-1">+{project.team.length - 5}</span>
            )}
          </div>
          <p className="text-[12px] text-[#888880]">{project.team.length} member{project.team.length !== 1 ? 's' : ''} · {pending} pending</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => onOpen(project.id)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 h-10 bg-[#E8642A] text-white rounded-xl font-bold text-[13px]"
        >
          Open Project <ArrowRight size={14} />
        </motion.button>
        {(project.status === 'brief_sent' || project.status === 'active') && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-5 h-10 border border-[#E4E2DC] text-[#555] rounded-xl font-bold text-[13px] hover:border-[#E8642A] transition-colors"
          >
            Project Room
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function MyProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleCreated = (p: Project) => {
    setCreateOpen(false);
    setProjects(getProjects());
    navigate(`/dashboard/homeowner`);
  };

  const handleOpen = (id: string) => {
    navigate('/dashboard/homeowner');
    localStorage.setItem('buildlink_active_project', id);
  };

  const first = projects[0];
  const rest = projects.slice(1);

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <Navbar />

      <div className="pt-32 pb-20 max-w-[1200px] mx-auto px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-8 pb-6 border-b border-[#E4E2DC]"
        >
          <div>
            <h1 className="text-[32px] font-black text-[#111] tracking-tight mb-1">My Projects</h1>
            <p className="text-[#888880] text-[15px]">Manage all your renovation and build projects</p>
          </div>
          <motion.button
            onClick={() => setCreateOpen(true)}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 h-11 bg-[#E8642A] text-white rounded-full font-bold text-[14px] shadow-sm"
          >
            <Plus size={16} /> New Project
          </motion.button>
        </motion.div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <FolderOpen size={64} className="text-[#D4D2CC] mb-6" />
            <h2 className="text-[22px] font-black text-[#888880] mb-2">No projects yet</h2>
            <p className="text-[15px] text-[#888880] mb-8">Start by creating your first project</p>
            <motion.button
              onClick={() => setCreateOpen(true)}
              whileHover={{ scale: 1.03 }}
              animate={{ boxShadow: ['0 0 0 0 rgba(232,100,42,0)', '0 0 0 10px rgba(232,100,42,0.15)', '0 0 0 0 rgba(232,100,42,0)'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-2 px-8 h-12 bg-[#E8642A] text-white rounded-xl font-bold text-[15px]"
            >
              <Plus size={18} /> Create First Project →
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Featured — full width */}
            {first && (
              <ProjectCard project={first} featured index={0} onOpen={handleOpen} />
            )}

            {/* Rest — 2 col grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rest.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i + 1} onOpen={handleOpen} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {createOpen && (
          <CreateProjectModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
        )}
      </AnimatePresence>
    </div>
  );
}
