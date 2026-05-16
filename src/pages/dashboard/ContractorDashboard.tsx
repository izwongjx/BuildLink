import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, TrendingUp, Sparkles, ArrowRight, Clock, MapPin,
  Inbox, Check, X, ChevronDown, Loader2, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getHomeownerProjects, getSuppliers } from '../../lib/db';
import { getProjects, getProject, updateProject, addNotification } from '../../lib/projects';
import Navbar from '../../components/layout/Navbar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Invitation {
  id: string;
  projectId: string;
  projectName: string;
  homeownerLocation: string;
  projectType: string;
  budget: string;
  scopesCovered: string[];
  status: 'pending' | 'accepted' | 'declined';
  description: string;
}

// ─── Invitation Card ──────────────────────────────────────────────────────────
function InvitationCard({ inv, onAccept, onDecline }: {
  inv: Invitation;
  onAccept: (id: string) => void;
  onDecline: (id: string, reason: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleAccept = async () => {
    setAccepting(true);
    await new Promise(r => setTimeout(r, 800));
    onAccept(inv.id);
    setAccepting(false);
  };

  const handleDeclineConfirm = async () => {
    setDeclining(true);
    await new Promise(r => setTimeout(r, 500));
    onDecline(inv.id, declineReason);
    setDeclining(false);
    setShowDeclineModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      className="bg-white border border-[#E4E2DC] rounded-2xl overflow-hidden"
      style={{ borderLeft: '4px solid #2B5CE6', borderRadius: '14px' }}
    >
      <div className="p-6">
        {/* Top */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-[18px] font-black text-[#111]">{inv.projectName}</h3>
          {inv.status === 'pending' && (
            <span className="px-2.5 py-1 bg-[#EBF0FD] text-[#2B5CE6] text-[11px] font-bold rounded-full shrink-0">
              Pending Response
            </span>
          )}
          {inv.status === 'accepted' && (
            <span className="px-2.5 py-1 bg-[#E8F5EC] text-[#1A7A4A] text-[11px] font-bold rounded-full shrink-0 flex items-center gap-1">
              <Check size={11} /> Accepted
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 text-[12px] text-[#888880]">
            <MapPin size={11} /> Homeowner in {inv.homeownerLocation}
          </span>
          <span className="px-2 py-0.5 bg-[#F7F6F3] border border-[#E4E2DC] rounded text-[11px] font-semibold text-[#555]">
            {inv.projectType}
          </span>
          {inv.budget && (
            <span className="px-2 py-0.5 bg-[#FDF3EE] text-[#E8642A] text-[11px] font-bold rounded">
              {inv.budget}
            </span>
          )}
        </div>

        {/* Your scope */}
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880] mb-2">Your scope</p>
          <div className="flex flex-wrap gap-1.5">
            {inv.scopesCovered.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#EBF0FD] text-[#2B5CE6]">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Brief preview */}
        {inv.description && (
          <div className="mb-5">
            <motion.div
              animate={{ height: expanded ? 'auto' : '3.6em' }}
              className="overflow-hidden text-[13px] text-[#555] leading-relaxed relative"
            >
              {inv.description}
              {!expanded && <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white" />}
            </motion.div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-[12px] font-bold text-[#2B5CE6] mt-1 flex items-center gap-1"
            >
              {expanded ? 'Show less' : 'Read more'} <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* Buttons */}
        {inv.status === 'pending' && (
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleAccept}
              disabled={accepting}
              whileHover={!accepting ? { scale: 1.02 } : {}}
              whileTap={!accepting ? { scale: 0.97 } : {}}
              className="flex items-center gap-2 px-5 h-10 bg-[#2B5CE6] text-white rounded-xl font-bold text-[13px]"
            >
              {accepting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {accepting ? 'Accepting...' : 'Accept'}
            </motion.button>
            <motion.button
              onClick={() => setShowDeclineModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 h-10 border-2 border-red-200 text-red-600 rounded-xl font-bold text-[13px] hover:border-red-400 transition-colors"
            >
              <X size={14} /> Decline
            </motion.button>
          </div>
        )}

        {inv.status === 'accepted' && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-5 h-10 border border-[#2B5CE6] text-[#2B5CE6] rounded-xl font-bold text-[13px] hover:bg-[#EBF0FD] transition-colors"
          >
            <ExternalLink size={14} /> Open Project Room
          </motion.button>
        )}
      </div>

      {/* Decline Modal (inline slide-up) */}
      <AnimatePresence>
        {showDeclineModal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#F0EFEB] bg-[#F7F6F3] overflow-hidden"
          >
            <div className="p-5">
              <h4 className="text-[14px] font-bold text-[#111] mb-3">Decline this invitation?</h4>
              <select
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E4E2DC] rounded-xl text-[13px] text-[#111] focus:outline-none focus:border-[#E8642A] mb-3"
              >
                <option value="">Select a reason...</option>
                <option value="Fully Booked">Fully Booked</option>
                <option value="Outside Service Area">Outside Service Area</option>
                <option value="Budget Mismatch">Budget Mismatch</option>
                <option value="Scope Not My Expertise">Scope Not My Expertise</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleDeclineConfirm}
                  disabled={!declineReason || declining}
                  whileHover={declineReason && !declining ? { scale: 1.02 } : {}}
                  className={`flex items-center gap-2 px-4 h-9 rounded-xl text-[13px] font-bold transition-all ${
                    declineReason && !declining ? 'bg-red-600 text-white' : 'bg-[#E4E2DC] text-[#888880] cursor-not-allowed'
                  }`}
                >
                  {declining ? <Loader2 size={13} className="animate-spin" /> : null}
                  Confirm Decline
                </motion.button>
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="px-4 h-9 border border-[#E4E2DC] text-[#555] rounded-xl text-[13px] font-bold hover:border-[#111] transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ContractorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ai' | 'jobs' | 'invitations'>('ai');
  const [subTab, setSubTab] = useState<'homeowners' | 'suppliers'>('homeowners');
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const isOnboarded = !!localStorage.getItem('buildlink_onboarded_contractor');
  const contractorData = useMemo(() => {
    const data = localStorage.getItem('buildlink_contractor_data');
    return data ? JSON.parse(data) : { services: ['Plumbing', 'Electrical'] };
  }, []);

  const contractorId = useMemo(() => {
    const data = localStorage.getItem('buildlink_contractor_data');
    return data ? JSON.parse(data).id || 'contractor-1' : 'contractor-1';
  }, []);

  useEffect(() => {
    if (!isOnboarded) navigate('/onboarding/contractor');
    setProjects(getHomeownerProjects());
    setSuppliers(getSuppliers());

    // Build invitations from any projects that have this contractor in their team
    const allProjects = getProjects();
    const myInvites: Invitation[] = [];
    allProjects.forEach(p => {
      p.team.forEach(m => {
        if (m.type === 'contractor' && m.status !== 'declined') {
          myInvites.push({
            id: `${p.id}-${m.profileId}`,
            projectId: p.id,
            projectName: p.name,
            homeownerLocation: p.location || 'Malaysia',
            projectType: p.type,
            budget: p.budget,
            scopesCovered: m.scopesCovered,
            status: m.status === 'accepted' ? 'accepted' : m.status === 'declined' ? 'declined' : 'pending',
            description: p.description,
          });
        }
      });
    });
    setInvitations(myInvites);
  }, [isOnboarded, navigate]);

  const filteredHomeowners = useMemo(() => {
    return projects.map(p => {
      const services = contractorData.services || [];
      const matchCount = p.servicesNeeded?.filter((s: string) =>
        services.some((cs: string) => cs.toLowerCase().includes(s.toLowerCase()))
      ).length || 0;
      const score = p.servicesNeeded?.length ? Math.round((matchCount / p.servicesNeeded.length) * 100) : 0;
      return { ...p, score };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);
  }, [projects, contractorData]);

  const handleAccept = (invId: string) => {
    setInvitations(prev => prev.map(i => i.id === invId ? { ...i, status: 'accepted' } : i));
    const inv = invitations.find(i => i.id === invId);
    if (inv) {
      const p = getProject(inv.projectId);
      if (p) {
        p.team = p.team.map(m => 
          `${p.id}-${m.profileId}` === invId ? { ...m, status: 'accepted', respondedAt: Date.now() } : m
        );
        updateProject(p);
      }
      addNotification({
        projectId: inv.projectId,
        projectName: inv.projectName,
        type: 'accepted',
        fromName: contractorData.businessName || 'Contractor',
        fromType: 'contractor',
        scope: inv.scopesCovered[0] || null,
        declinedScope: null,
      });
      window.dispatchEvent(new Event('buildlink_notif_update'));
    }
  };

  const handleDecline = (invId: string, reason: string) => {
    setInvitations(prev => prev.filter(i => i.id !== invId));
    const inv = invitations.find(i => i.id === invId);
    if (inv) {
      const p = getProject(inv.projectId);
      if (p) {
        p.team = p.team.map(m => 
          `${p.id}-${m.profileId}` === invId ? { ...m, status: 'declined', respondedAt: Date.now() } : m
        );
        updateProject(p);
      }
      addNotification({
        projectId: inv.projectId,
        projectName: inv.projectName,
        type: 'declined',
        fromName: contractorData.businessName || 'Contractor',
        fromType: 'contractor',
        scope: inv.scopesCovered[0] || null,
        declinedScope: inv.scopesCovered[0] || null,
      });
      window.dispatchEvent(new Event('buildlink_notif_update'));
    }
  };

  const pendingCount = invitations.filter(i => i.status === 'pending').length;

  const containerVars = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVars = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <div className="pt-32 pb-12 max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row gap-12">

        <main className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex gap-8 border-b border-border mb-10 overflow-x-auto no-scrollbar">
            {(['ai', 'jobs', 'invitations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-black text-[15px] uppercase tracking-widest transition-colors whitespace-nowrap relative flex items-center gap-2 ${activeTab === tab ? 'text-[#111]' : 'text-text-muted hover:text-[#111]'}`}
              >
                {tab === 'ai' && 'AI Suggestions'}
                {tab === 'jobs' && 'Marketplace'}
                {tab === 'invitations' && (
                  <>
                    Invitations
                    {pendingCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                        className="w-5 h-5 bg-[#E8642A] text-white text-[10px] font-black rounded-full flex items-center justify-center"
                      >
                        {pendingCount}
                      </motion.span>
                    )}
                  </>
                )}
                {activeTab === tab && <motion.div layoutId="contractor_tab_ind" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111]" />}
              </button>
            ))}
          </div>

          {/* AI Suggestions Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {!isOnboarded ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <Sparkles size={32} className="text-[#E8642A] mb-4" />
                    <h2 className="text-[28px] font-black text-[#111] mb-3">Your matches are waiting</h2>
                    <Link to="/onboarding/contractor">
                      <Button size="lg" className="px-8 h-12 rounded-xl">Start Onboarding <ArrowRight size={16} /></Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      {(['homeowners', 'suppliers'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setSubTab(s)}
                          className={`px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${subTab === s ? 'bg-[#111] text-white' : 'bg-surface border border-border text-text-muted hover:border-[#111]'}`}
                        >
                          {s === 'homeowners' ? 'Leads for You' : 'Material Suppliers'}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div key={subTab} variants={containerVars} initial="hidden" animate="visible" className="grid gap-5">
                        {subTab === 'homeowners' ? (
                          filteredHomeowners.length > 0 ? filteredHomeowners.map(p => (
                            <motion.div variants={itemVars} key={p.id}>
                              <Card className="p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-none shadow-lg rounded-[24px] bg-white">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-[#E8642A] text-white flex items-center justify-center font-black text-lg">{p.name.charAt(0)}</div>
                                    <div>
                                      <h3 className="font-black text-xl text-[#111]">{p.name}</h3>
                                      <p className="text-sm text-text-muted flex items-center gap-1"><MapPin size={13} /> {p.location}</p>
                                    </div>
                                    <div className="ml-auto px-4 py-1.5 bg-[#FDF3EE] text-[#E8642A] rounded-full font-black text-sm">{p.score}% Match</div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {p.servicesNeeded?.map((s: string) => (
                                      <span key={s} className="px-3 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-lg text-[11px] font-bold text-[#111] uppercase tracking-wider">{s}</span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-5 text-sm text-text-muted font-semibold">
                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {p.timeline}</span>
                                    <span>Budget: {p.budget}</span>
                                  </div>
                                </div>
                                <Button className="h-11 px-7 rounded-xl font-black shrink-0">Quote Now</Button>
                              </Card>
                            </motion.div>
                          )) : (
                            <div className="py-20 text-center border-2 border-dashed border-border rounded-[24px]">
                              <p className="text-text-muted font-bold">No homeowners currently seeking your specific services.</p>
                              <p className="text-sm text-text-muted mt-2">Your services: {contractorData.services?.join(', ')}</p>
                            </div>
                          )
                        ) : (
                          suppliers.length > 0 ? suppliers.map(s => (
                            <motion.div variants={itemVars} key={s.id}>
                              <Card className="p-5 flex items-center justify-between border-[#E4E2DC] hover:border-[#E8642A] transition-all rounded-[20px] bg-white shadow-sm">
                                <div className="flex items-center gap-4">
                                  <div className="w-11 h-11 rounded-xl bg-[#F7F6F3] border border-[#E4E2DC] flex items-center justify-center font-black text-lg text-[#111]">{s.name.charAt(0)}</div>
                                  <div>
                                    <h3 className="font-bold text-[16px] text-[#111]">{s.name}</h3>
                                    <p className="text-xs text-text-muted font-semibold">{s.location}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" className="font-bold" onClick={() => navigate(`/profile/supplier/${s.id}`)}>View Products</Button>
                              </Card>
                            </motion.div>
                          )) : (
                            <div className="py-16 text-center border-2 border-dashed border-border rounded-[24px]">
                              <p className="text-text-muted">No suppliers registered yet.</p>
                            </div>
                          )
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* Marketplace tab (kept simple) */}
            {activeTab === 'jobs' && (
              <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="py-20 text-center border-2 border-dashed border-[#E4E2DC] rounded-[24px]">
                  <Briefcase size={40} className="text-[#D4D2CC] mx-auto mb-4" />
                  <p className="text-[#888880] font-bold text-[16px]">Open marketplace coming soon</p>
                  <p className="text-[13px] text-[#888880] mt-2">Browse publicly posted projects from homeowners.</p>
                </div>
              </motion.div>
            )}

            {/* Invitations tab */}
            {activeTab === 'invitations' && (
              <motion.div key="invitations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {invitations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#E4E2DC] rounded-[24px]">
                    <Inbox size={40} className="text-[#D4D2CC] mb-4" />
                    <h3 className="text-[18px] font-bold text-[#888880] mb-2">No invitations yet</h3>
                    <p className="text-[14px] text-[#888880] max-w-sm">When homeowners add you to their project, it shows up here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#888880] mb-2">
                      {pendingCount} pending · {invitations.length - pendingCount} responded
                    </p>
                    <AnimatePresence>
                      {invitations.map((inv, i) => (
                        <motion.div
                          key={inv.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                        >
                          <InvitationCard inv={inv} onAccept={handleAccept} onDecline={handleDecline} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="font-bold text-[15px] text-[#111] mb-4">Profile Completeness</h3>
            <div className="relative w-20 h-20 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#F0EFEB" strokeWidth="6" fill="transparent" />
                <circle cx="40" cy="40" r="34" stroke="#E8642A" strokeWidth="6" fill="transparent" strokeDasharray="213" strokeDashoffset="43" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-[18px] text-[#111]">80%</div>
            </div>
            <p className="text-[12px] text-center text-text-muted mb-3">Add your license number to reach 100%.</p>
            <Button variant="ghost" className="w-full" size="sm">Complete Profile</Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-[15px] text-[#111] mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-[13px] text-text-muted"><Briefcase size={15} /> Active Jobs</span>
                <span className="font-bold text-[#111]">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-[13px] text-text-muted"><TrendingUp size={15} /> Profile Views</span>
                <span className="font-bold text-[#111]">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-[13px] text-text-muted"><Inbox size={15} /> Pending Invites</span>
                <span className="font-bold text-[#E8642A]">{pendingCount}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
