import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCircle2, XCircle, MessageCircle, Star, Inbox, ArrowRight } from 'lucide-react';
import {
  getNotifications, markNotificationRead, markAllRead, getUnreadCount,
  getContractors, getSuppliers, Notification
} from '../../lib/projects';

interface Props {
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'accepted') return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0"><CheckCircle2 size={16} className="text-green-700" /></div>;
  if (type === 'declined') return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0"><XCircle size={16} className="text-red-600" /></div>;
  if (type === 'message') return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><MessageCircle size={16} className="text-blue-600" /></div>;
  if (type === 'project_ready') return <div className="w-8 h-8 rounded-full bg-[#FDF3EE] flex items-center justify-center shrink-0"><Star size={16} className="text-[#E8642A]" /></div>;
  return <div className="w-8 h-8 rounded-full bg-[#F0EFEB] flex items-center justify-center shrink-0"><Inbox size={16} className="text-[#888880]" /></div>;
}

export default function NotificationPanel({ onClose, onNavigate }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [expandedDecline, setExpandedDecline] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = () => setNotifs(getNotifications());

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('buildlink_notif_update', handler);
    return () => window.removeEventListener('buildlink_notif_update', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleRead = (id: string) => {
    markNotificationRead(id);
    load();
  };

  const handleMarkAll = () => {
    markAllRead();
    load();
  };

  // Get top replacement for a declined scope
  const getReplacement = (notif: Notification) => {
    const contractors = getContractors();
    return contractors.find(c =>
      c.tags?.some((t: string) =>
        notif.declinedScope && t.toLowerCase().includes(notif.declinedScope.toLowerCase())
      )
    ) || null;
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
      className="absolute top-full right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-[#E4E2DC] z-50 max-h-[480px] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EFEB] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-[#111]">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 bg-[#E8642A] text-white text-[11px] font-bold rounded-full">{unread}</span>
          )}
        </div>
        <button onClick={handleMarkAll} className="text-[12px] text-[#888880] hover:text-[#E8642A] transition-colors font-medium">
          Mark all read
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <Inbox size={32} className="text-[#D4D2CC] mb-3" />
            <p className="text-[14px] font-semibold text-[#888880]">No notifications yet</p>
            <p className="text-[12px] text-[#888880] mt-1">Activity from your projects will appear here.</p>
          </div>
        ) : (
          notifs.map((n, i) => {
            const isUnread = !n.read;
            const isDeclined = n.type === 'declined';
            const expanded = expandedDecline === n.id;
            const replacement = isDeclined ? getReplacement(n) : null;

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                onClick={() => handleRead(n.id)}
                className={`px-5 py-4 border-b border-[#F0EFEB] last:border-0 cursor-pointer transition-all ${
                  isUnread ? 'bg-[#FDFAF8] border-l-[3px] border-l-[#E8642A]' : 'hover:bg-[#F7F6F3]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <NotifIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold text-[#111] leading-tight">
                        {n.type === 'accepted' && `${n.fromName} accepted your invitation`}
                        {n.type === 'declined' && `${n.fromName} declined your invitation`}
                        {n.type === 'message' && `${n.fromName} sent a message`}
                        {n.type === 'project_ready' && `Your team is complete!`}
                      </p>
                      <span className="text-[11px] text-[#888880] shrink-0 mt-0.5">{timeAgo(n.timestamp)}</span>
                    </div>
                    <p className="text-[12px] text-[#888880] mt-0.5">
                      {n.projectName}{n.scope ? ` · ${n.scope}` : ''}
                    </p>

                    {/* Action row */}
                    <div className="flex items-center gap-3 mt-2">
                      {n.type === 'accepted' && (
                        <button
                          onClick={e => { e.stopPropagation(); onNavigate?.(`/project/${n.projectId}/room`); onClose(); }}
                          className="text-[11px] font-bold text-[#E8642A] hover:underline"
                        >
                          Open Project →
                        </button>
                      )}
                      {n.type === 'declined' && (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); setExpandedDecline(prev => prev === n.id ? null : n.id); }}
                            className="px-3 py-1 bg-[#E8642A] text-white text-[11px] font-bold rounded-full hover:bg-[#d4571f] transition-colors"
                          >
                            Auto-suggest Replacement
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); onClose(); }}
                            className="px-3 py-1 border border-[#E4E2DC] text-[#555] text-[11px] font-bold rounded-full hover:border-[#E8642A] transition-colors"
                          >
                            Browse AI
                          </button>
                        </>
                      )}
                      {n.type === 'project_ready' && (
                        <button
                          onClick={e => { e.stopPropagation(); onNavigate?.('/dashboard/homeowner'); onClose(); }}
                          className="text-[11px] font-bold text-[#E8642A] hover:underline"
                        >
                          Send Brief →
                        </button>
                      )}
                    </div>

                    {/* Inline replacement card */}
                    <AnimatePresence>
                      {isDeclined && expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {replacement ? (
                            <div className="mt-3 p-3 bg-white border border-[#E4E2DC] rounded-xl">
                              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880] mb-2">Top Replacement</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-[#2B5CE6] text-white flex items-center justify-center text-[12px] font-bold">
                                    {replacement.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-bold text-[#111]">{replacement.name}</p>
                                    <p className="text-[11px] text-[#888880]">{replacement.location}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); onClose(); }}
                                  className="px-3 py-1.5 bg-[#2B5CE6] text-white text-[11px] font-bold rounded-full"
                                >
                                  Add to Project
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-[12px] text-[#888880] italic">No direct replacement found. Browse AI suggestions.</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
