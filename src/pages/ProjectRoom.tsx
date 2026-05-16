import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, Send, ArrowLeft, MapPin } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getProject, addMessageToThread, Project, Thread, Message } from '../lib/projects';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  assembling: { label: 'Assembling', color: '#F59E0B', bg: '#FEF3C7' },
  brief_sent:  { label: 'Brief Sent', color: '#2B5CE6', bg: '#EBF0FD' },
  active:      { label: 'Active',     color: '#1A7A4A', bg: '#E8F5EC' },
  completed:   { label: 'Completed',  color: '#888880', bg: '#F0EFEB' },
};

const HOMEOWNER_ID = 'homeowner';
const HOMEOWNER_NAME = 'You';

const SEED_MESSAGES = [
  (scope: string, name: string): Omit<Message, 'timestamp'> => ({
    senderId: 'other', senderName: name, senderType: 'contractor',
    text: `Hi, I've received your project brief. I'm available for ${scope}. When would you like to start?`,
  }),
  (_scope: string, name: string): Omit<Message, 'timestamp'> => ({
    senderId: 'other', senderName: name, senderType: 'contractor',
    text: 'Could you share more details on the specifications?',
  }),
  (_scope: string, _name: string): Omit<Message, 'timestamp'> => ({
    senderId: HOMEOWNER_ID, senderName: HOMEOWNER_NAME, senderType: 'homeowner',
    text: 'Hi! Looking forward to working with you. Will share the specs shortly.',
  }),
];

function Bubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
      animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[68%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && <p className="text-[11px] font-bold text-[#888880] mb-1 ml-1">{msg.senderName}</p>}
        <div
          className="px-4 py-3 text-[14px] leading-relaxed"
          style={{
            background: isOwn ? '#E8642A' : '#F0EFEB',
            color: isOwn ? 'white' : '#111',
            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          }}
        >
          {msg.text}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className="text-[11px] text-[#888880] mt-1 mx-1"
        >
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </motion.p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="px-4 py-3 bg-[#F0EFEB] rounded-2xl flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-[#888880] rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [seeded, setSeeded] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (!id) return;
    const p = getProject(id);
    if (!p) return;
    setProject(p);
    if (!activeThread && p.threads.length > 0) {
      setActiveThread(p.threads[0]);
    }
  }, [id, activeThread]);

  useEffect(() => { load(); }, [load]);

  // Seed messages on first open of a thread
  useEffect(() => {
    if (!activeThread || !project || seeded.has(activeThread.id)) return;

    const existingMsgs = activeThread.messages;
    if (existingMsgs.length > 0) {
      setMessages(existingMsgs);
      setSeeded(prev => new Set(prev).add(activeThread.id));
      return;
    }

    setSeeded(prev => new Set(prev).add(activeThread.id));
    const member = project.team.find(m =>
      m.scopesCovered.includes(activeThread.scope)
    );
    if (!member) return;

    const delays = [500, 1200, 2200];
    const seeds = SEED_MESSAGES.map((fn, i) => fn(activeThread.scope, member.name));

    seeds.forEach((msg, i) => {
      setTimeout(() => {
        const fullMsg: Message = { ...msg, timestamp: Date.now() };
        addMessageToThread(project.id, activeThread.id, msg);
        setMessages(prev => [...prev, fullMsg]);
      }, delays[i]);
    });
  }, [activeThread, project, seeded]);

  useEffect(() => {
    if (activeThread) {
      const p = getProject(id!);
      const t = p?.threads.find(t => t.id === activeThread.id);
      setMessages(t?.messages || []);
    }
  }, [activeThread, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim() || !activeThread || !project) return;
    const msg: Omit<Message, 'timestamp'> = {
      senderId: HOMEOWNER_ID,
      senderName: HOMEOWNER_NAME,
      senderType: 'homeowner',
      text: input.trim(),
    };
    const fullMsg: Message = { ...msg, timestamp: Date.now() };
    addMessageToThread(project.id, activeThread.id, msg);
    setMessages(prev => [...prev, fullMsg]);
    setInput('');

    // Simulate reply
    setTimeout(() => setTyping(true), 1500);
    setTimeout(() => {
      setTyping(false);
      const replies = ['Thanks, noted!', 'Got it, will prepare accordingly.', 'Understood, I\'ll get back to you shortly.'];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: Omit<Message, 'timestamp'> = {
        senderId: 'other',
        senderName: activeThread.participants[0]?.name || 'Team',
        senderType: 'contractor',
        text: reply,
      };
      const fullReply: Message = { ...replyMsg, timestamp: Date.now() };
      addMessageToThread(project.id, activeThread.id, replyMsg);
      setMessages(prev => [...prev, fullReply]);
    }, 3500);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <p className="text-[#888880]">Loading project...</p>
      </div>
    );
  }

  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.assembling;

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 80, height: '100vh' }}>

        {/* ── LEFT PANEL ──────────────────────────── */}
        <div className="w-[260px] shrink-0 bg-white border-r border-[#E4E2DC] flex flex-col overflow-y-auto">
          {/* Back */}
          <div className="p-4 border-b border-[#F0EFEB]">
            <button
              onClick={() => navigate('/dashboard/homeowner')}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#888880] hover:text-[#111] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>

          {/* Project Info */}
          <div className="p-5 border-b border-[#F0EFEB]">
            <h2 className="text-[15px] font-black text-[#111] mb-2 leading-tight">{project.name}</h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold inline-block mb-2" style={{ color: status.color, background: status.bg }}>
              {status.label}
            </span>
            {project.location && (
              <p className="text-[12px] text-[#888880] flex items-center gap-1 mt-1">
                <MapPin size={10} /> {project.location}
              </p>
            )}
          </div>

          {/* Threads */}
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888880] mb-3">Threads</p>
            {project.threads.length === 0 ? (
              <p className="text-[13px] text-[#888880] italic">No threads yet. Send your brief first.</p>
            ) : (
              <div className="space-y-1">
                {project.threads.map((t, i) => {
                  const member = project.team.find(m => m.scopesCovered.includes(t.scope));
                  const isActive = activeThread?.id === t.id;
                  const unread = 0; // simplified
                  const lastMsg = t.messages[t.messages.length - 1];
                  return (
                    <motion.button
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                      onClick={() => setActiveThread(t)}
                      className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                        isActive ? 'bg-[#F7F6F3]' : 'hover:bg-[#F7F6F3]'
                      }`}
                      style={isActive ? { borderLeft: '3px solid #E8642A' } : {}}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-[#111]">{t.scope}</p>
                        {unread > 0 && (
                          <span className="w-4 h-4 bg-[#E8642A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      {member && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-[#2B5CE6] text-white text-[9px] font-bold flex items-center justify-center">
                            {member.name.charAt(0)}
                          </div>
                          <span className="text-[11px] text-[#888880] truncate">{member.name}</span>
                        </div>
                      )}
                      {lastMsg && (
                        <p className="text-[11px] text-[#888880] truncate mt-1">{lastMsg.text}</p>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN THREAD VIEW ───────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAF8]">
          {activeThread ? (
            <>
              {/* Thread header */}
              <div className="bg-white border-b border-[#E4E2DC] px-8 py-4">
                <h3 className="text-[20px] font-black text-[#111] mb-2">{activeThread.scope}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.team
                    .filter(m => m.scopesCovered.includes(activeThread.scope))
                    .map(m => (
                      <span
                        key={m.profileId}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: m.type === 'contractor' ? '#EBF0FD' : '#E8F5EC', color: m.type === 'contractor' ? '#2B5CE6' : '#1A7A4A' }}
                      >
                        {m.name.charAt(0)} {m.name}
                      </span>
                    ))
                  }
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <Bubble key={`${msg.senderId}-${msg.timestamp}-${i}`} msg={msg} isOwn={msg.senderId === HOMEOWNER_ID} />
                  ))}
                  {typing && <TypingIndicator />}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-[#E4E2DC] px-6 py-4 flex items-center gap-3">
                <button className="text-[#888880] hover:text-[#111] transition-colors shrink-0">
                  <Paperclip size={18} />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={`Message the ${activeThread.scope} team...`}
                  className="flex-1 h-11 px-4 bg-[#F7F6F3] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#E8642A] transition-all"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  whileHover={input.trim() ? { scale: 1.05 } : {}}
                  whileTap={input.trim() ? { scale: 0.95 } : {}}
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{ background: input.trim() ? '#E8642A' : '#E4E2DC' }}
                >
                  <Send size={18} className="text-white" />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[#888880] text-[15px] font-semibold mb-2">No thread selected</p>
                <p className="text-[13px] text-[#888880]">
                  {project.threads.length === 0
                    ? 'Send your project brief to open threads with your team.'
                    : 'Select a thread from the left panel.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
