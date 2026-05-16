import { Bookmark, Star, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

export default function SavedMatches() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('buildlink_saved_matches');
    if (data) {
      setSaved(JSON.parse(data));
    }
  }, []);

  const removeMatch = (id: string, type: string) => {
    const updated = saved.filter(item => !(item.id === id && item.type === type));
    setSaved(updated);
    localStorage.setItem('buildlink_saved_matches', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-muted hover:text-[#111] transition-colors mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {saved.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark size={32} className="text-accent" />
              </div>
              <h1 className="text-4xl font-black text-[#111] mb-4">Saved Matches</h1>
              <p className="text-text-muted text-lg mb-8 max-w-md mx-auto">
                You haven't saved any contractors or suppliers yet. Bookmark profiles to see them here later.
              </p>
              <Link to="/dashboard/homeowner">
                <Button size="lg" className="rounded-xl px-10 font-black">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-10">
                <h1 className="text-5xl font-black tracking-tighter text-[#111]">Saved Matches</h1>
              </div>
              <div className="grid gap-4">
                {saved.map((item) => (
                  <Card key={item.id + item.type} className="p-8 flex items-center justify-between group rounded-[24px] border-border hover:border-accent hover:shadow-xl transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center font-black text-2xl group-hover:bg-accent-light group-hover:text-accent group-hover:border-accent-light transition-colors">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-2xl text-[#111] mb-1">{item.name}</h3>
                        <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{item.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link to={`/profile/${item.type}/${item.id}`}>
                        <Button variant="ghost" className="font-black group-hover:text-accent">
                          View Profile <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors" onClick={() => removeMatch(item.id, item.type)}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
