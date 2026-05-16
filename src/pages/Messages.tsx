import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const recipient = location.state?.recipient;
  const [msg, setMsg] = useState('');
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-muted hover:text-[#111] transition-colors mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="h-[70vh] border border-border rounded-[32px] bg-surface overflow-hidden flex shadow-2xl">
        {/* Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Messages</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
            <MessageSquare size={32} className="mb-4 opacity-20" />
            <p className="text-sm">No conversations yet.</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background/50">
          {recipient ? (
            <>
              <div className="p-6 border-b border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    {recipient.charAt(0)}
                  </div>
                  <h3 className="font-bold text-lg">{recipient}</h3>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                <div className="self-start max-w-[80%] bg-surface border border-border p-4 rounded-2xl rounded-tl-none">
                  <p className="text-sm">Hi! I saw your profile on BuildLink. I'm interested in working with you on my renovation project.</p>
                  <span className="text-[10px] text-text-muted mt-2 block">10:42 AM</span>
                </div>
                <div className="self-end max-w-[80%] bg-accent text-white p-4 rounded-2xl rounded-tr-none">
                  <p className="text-sm">Thanks for reaching out! I'd love to hear more about your project. When are you looking to start?</p>
                  <span className="text-[10px] opacity-70 mt-2 block">10:45 AM</span>
                </div>
              </div>
              <div className="p-6 bg-surface border-t border-border flex gap-4">
                <input 
                  type="text" 
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 bg-background border border-border rounded-xl px-4 focus:outline-none focus:border-accent transition-colors" 
                />
                <Button size="icon" className="w-12 h-12 rounded-xl">
                  <Send size={20} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="text-center max-w-sm">
                <h3 className="text-2xl font-bold mb-2">Select a chat</h3>
                <p className="text-text-muted">Reach out to a contractor or supplier to start a conversation about your project.</p>
                <Button className="mt-6" variant="ghost">Browse Matches</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
);
}
