import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Check, Loader2, Send } from 'lucide-react';
import { Project, sendProjectBrief, addNotification, uuid } from '../../lib/projects';

interface Props {
  project: Project;
  onClose: () => void;
  onSent: (updatedProject: Project) => void;
}

const spring = { type: 'spring', stiffness: 300, damping: 26 };

export default function BriefModal({ project, onClose, onSent }: Props) {
  const [sending, setSending] = useState(false);
  const [sentRows, setSentRows] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const recipients = project.team.filter(m => m.status !== 'declined');

  const handleSend = async () => {
    if (sending || done) return;
    setSending(true);

    // Stagger "sent" checkmarks
    for (let i = 0; i < recipients.length; i++) {
      await new Promise(r => setTimeout(r, 1200 + i * 300));
      setSentRows(prev => [...prev, recipients[i].profileId]);
    }

    await new Promise(r => setTimeout(r, 400));

    // Update project status
    const updated = sendProjectBrief(project.id);

    // Write notifications and simulate responses
    recipients.forEach((member, idx) => {
      // The brief was "sent" notification (simulated as direct accept/decline after delay)
      const delay = 4000 + Math.random() * 5000;
      const shouldDecline = idx === recipients.length - 1 && recipients.length > 1;

      setTimeout(() => {
        if (shouldDecline) {
          addNotification({
            projectId: project.id,
            projectName: project.name,
            type: 'declined',
            fromName: member.name,
            fromType: member.type,
            scope: member.scopesCovered[0] || null,
            declinedScope: member.scopesCovered[0] || null,
          });
        } else {
          addNotification({
            projectId: project.id,
            projectName: project.name,
            type: 'accepted',
            fromName: member.name,
            fromType: member.type,
            scope: member.scopesCovered[0] || null,
            declinedScope: null,
          });
        }
        // Trigger storage event for Navbar bell refresh
        window.dispatchEvent(new Event('buildlink_notif_update'));
      }, delay);
    });

    setSending(false);
    setDone(true);
    if (updated) onSent(updated);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={!sending ? onClose : undefined}
      />
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#F0EFEB] shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] font-bold text-[#111]">Your Project Brief</h2>
              <span className="px-3 py-1 bg-[#F7F6F3] border border-[#E4E2DC] rounded-full text-[12px] font-semibold text-[#555]">
                {project.name}
              </span>
            </div>
            {!sending && (
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F6F3] text-[#888880] transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {done ? (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } }}
                className="flex flex-col items-center justify-center py-16 px-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, transition: spring }}
                  className="w-20 h-20 rounded-full bg-[#E8642A] flex items-center justify-center mb-6"
                >
                  <Check size={36} className="text-white" strokeWidth={3} />
                </motion.div>
                <h3 className="text-[24px] font-black text-[#111] mb-2 text-center">
                  Brief sent to {recipients.length} {recipients.length === 1 ? 'party' : 'parties'}
                </h3>
                <p className="text-[15px] text-[#888880] text-center mb-8">
                  You'll be notified when they respond. Check the bell icon for updates.
                </p>
                <button
                  onClick={onClose}
                  className="px-8 h-12 bg-[#111] text-white rounded-xl font-bold text-[14px] hover:bg-black transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <div className="px-8 py-6">
                {/* Brief Preview */}
                <div className="bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl p-6 mb-6 relative">
                  <button className="absolute top-4 right-4 text-[#888880] hover:text-[#111] transition-colors" title="Print">
                    <Printer size={16} />
                  </button>
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-[18px] font-bold text-[#111]">{project.name}</h3>
                      <span className="px-2 py-0.5 bg-white border border-[#E4E2DC] rounded text-[11px] font-semibold text-[#555]">{project.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[13px] text-[#888880] mb-1">
                      <span>📍 {project.location}</span>
                      <span>💰 {project.budget}</span>
                    </div>
                    {project.description && (
                      <p className="text-[13px] text-[#555] mt-3 leading-relaxed">{project.description}</p>
                    )}
                  </div>
                  <div className="border-t border-[#E4E2DC] pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880] mb-3">Scope of Work</p>
                    {project.scopeItems.map(si => (
                      <div key={si.id} className="flex items-center justify-between py-2 border-b border-[#E4E2DC] last:border-0">
                        <span className="text-[13px] font-medium text-[#111]">{si.service}</span>
                        {si.coveredBy ? (
                          <span className="text-[12px] text-[#888880]">
                            {si.coveredBy.type === 'contractor' ? '🔨' : '📦'} {si.coveredBy.name}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#888880] italic">Unassigned</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#888880] mb-4">Recipients</p>
                  {recipients.length === 0 ? (
                    <p className="text-[14px] text-[#888880] italic text-center py-6">No team members to send to yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {recipients.map((member, i) => (
                        <motion.div
                          key={member.profileId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                          className="flex items-center justify-between p-4 bg-[#F7F6F3] rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px]"
                              style={{ background: member.type === 'contractor' ? '#2B5CE6' : '#1A7A4A' }}
                            >
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#111]">{member.name}</p>
                              <p className="text-[12px] text-[#888880]">{member.scopesCovered.join(', ')}</p>
                            </div>
                          </div>
                          <AnimatePresence>
                            {sentRows.includes(member.profileId) ? (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, transition: spring }}
                                className="flex items-center gap-1.5 text-green-600 text-[12px] font-bold"
                              >
                                <Check size={14} /> Sent
                              </motion.div>
                            ) : (
                              <span className="text-[12px] text-[#888880]">Will receive brief</span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!done && (
            <div className="px-8 py-5 border-t border-[#F0EFEB] shrink-0">
              <motion.button
                onClick={handleSend}
                disabled={sending || recipients.length === 0}
                whileHover={!sending && recipients.length > 0 ? { y: -1 } : {}}
                whileTap={!sending && recipients.length > 0 ? { scale: 0.97 } : {}}
                className={`w-full h-12 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all ${
                  !sending && recipients.length > 0
                    ? 'bg-[#E8642A] text-white'
                    : 'bg-[#E4E2DC] text-[#888880] cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={16} /> Send Project Brief to {recipients.length} {recipients.length === 1 ? 'party' : 'parties'} →</>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
