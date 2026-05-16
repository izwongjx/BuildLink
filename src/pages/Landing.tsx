import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import BuildingModel from '../components/3d/BuildingModel';
import CraneModel from '../components/3d/CraneModel';

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const labelsVisible = scrollY < 250;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Z-0: BACKGROUND LAYERS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* White Hero Background */}
        <div className="h-screen w-full bg-background" />
        {/* Dark Background for Section 2 */}
        <div 
          className="h-[520px] w-full bg-[#111111]" 
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 3vw))' }} 
        />
      </div>

      {/* Z-0: STICKY CANVAS OVERLAY (Behind the black block) */}
      <div className="absolute top-0 left-0 w-full h-[calc(100vh+520px)] pointer-events-none z-0">
        <div className="sticky top-0 h-screen w-full flex items-center pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 h-full items-center">
            
            {/* Left side spacer for Text */}
            <div className="hidden lg:block pointer-events-none" />

            {/* Right side canvas container */}
            <div className="relative w-full h-[600px] flex justify-center items-center">
              
              {/* Feature Labels Overlay - only visible early in scroll */}
              <AnimatePresence>
                {labelsVisible && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    {/* Top Left */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: scrollY * -0.05 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="absolute top-[15%] -left-[10%] flex items-center gap-2"
                    >
                      <div className="bg-surface border border-border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm relative z-10">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-[12px] font-medium text-[#111]">Verified Contractors</span>
                      </div>
                      <svg className="absolute left-[100%] top-1/2 w-24 h-16 pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
                        <path d="M 0 8 L 90 40" stroke="#2B5CE6" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
                      </svg>
                    </motion.div>

                    {/* Top Right */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: scrollY * 0.05 }}
                      transition={{ delay: 1.3, duration: 0.6 }}
                      className="absolute top-[25%] -right-[5%] flex items-center gap-2 flex-row-reverse"
                    >
                      <div className="bg-surface border border-border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm relative z-10">
                        <div className="w-2 h-2 rounded-full bg-[#E8642A]" />
                        <span className="text-[12px] font-medium text-[#111]">Smart Matching</span>
                      </div>
                      <svg className="absolute right-[100%] top-1/2 w-24 h-16 pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
                        <path d="M 96 8 L 0 30" stroke="#E8642A" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
                      </svg>
                    </motion.div>

                    {/* Bottom Left */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: scrollY * -0.05 }}
                      transition={{ delay: 1.4, duration: 0.6 }}
                      className="absolute bottom-[30%] -left-[5%] flex items-center gap-2"
                    >
                      <div className="bg-surface border border-border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm relative z-10">
                        <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span className="text-[12px] font-medium text-[#111]">Quality Suppliers</span>
                      </div>
                      <svg className="absolute left-[100%] top-1/2 w-20 h-16 pointer-events-none" style={{ transform: 'translateY(-100%)' }}>
                        <path d="M 0 60 L 80 0" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
                      </svg>
                    </motion.div>

                    {/* Bottom Right */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: scrollY * 0.05 }}
                      transition={{ delay: 1.5, duration: 0.6 }}
                      className="absolute bottom-[20%] -right-[10%] flex items-center gap-2 flex-row-reverse"
                    >
                      <div className="bg-surface border border-border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm relative z-10">
                        <div className="w-2 h-2 rounded-full bg-[#888880]" />
                        <span className="text-[12px] font-medium text-[#111]">AI-Powered</span>
                      </div>
                      <svg className="absolute right-[100%] top-1/2 w-24 h-16 pointer-events-none" style={{ transform: 'translateY(-100%)' }}>
                        <path d="M 96 60 L 0 0" stroke="#888880" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.3" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas camera={{ position: [0, 0.5, 7], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[-5, 5, 5]} intensity={1.2} color="#ffffff" />
                  <pointLight position={[3, 3, 3]} intensity={0.6} color="#E8642A" />
                  <OrbitControls enableZoom={false} enablePan={false} />
                  <BuildingModel scrollY={scrollY} />
                  <Environment preset="city" />
                </Canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Z-10: MAIN CONTENT LAYERS */}
      <main className="relative z-10 pointer-events-none">
        
        {/* SECTION 1: HERO */}
        <section className="h-screen w-full flex items-center relative pointer-events-none">
          {/* Background Big Text */}
          <div className="absolute inset-0 flex justify-between items-center px-4 overflow-hidden pointer-events-none">
            <span className="text-[18vw] font-black text-[#111111] opacity-[0.03] leading-none select-none -ml-4">
              BUILD
            </span>
            <span className="text-[18vw] font-black text-[#111111] opacity-[0.03] leading-none select-none -mr-4">
              LINK
            </span>
          </div>

          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-30">
            {/* Left Column: Text */}
            <div className="text-left flex flex-col justify-center mt-20 lg:mt-0">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-6xl md:text-7xl font-black tracking-tighter mb-6 text-[#111] leading-[1.05]"
              >
                Connect.<br/>
                <span className="text-accent">Build.</span><br/>
                Deliver.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl md:text-2xl font-medium text-[#444] mb-10 max-w-[420px]"
              >
                The platform that links homeowners, contractors and suppliers — intelligently.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center justify-start gap-4 pointer-events-auto"
              >
                <Link to="/auth">
                  <Button size="lg" className="shadow-xl px-8 h-14 text-base rounded-xl">Get Started Free</Button>
                </Link>
                <Button variant="ghost" size="lg" className="h-14 px-8 text-base rounded-xl bg-white/50 backdrop-blur-sm border border-border hover:bg-white hover:text-accent transition-colors">See How It Works</Button>
              </motion.div>
            </div>
            
            {/* Right Column: Empty (allows canvas to be clicked) */}
            <div className="hidden lg:block w-full h-[600px] pointer-events-none"></div>
          </div>
        </section>

        {/* SECTION 2: DARK BLOCK CONTENT */}
        <section className="h-[520px] flex flex-col justify-center items-center text-center px-6 pointer-events-auto bg-[#111111]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 3vw))' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative z-30" // Ensures text sits above the Z-10 canvas
          >
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60 mb-6">
              ABOUT BUILDLINK
            </div>
            <h2 className="text-4xl md:text-[52px] font-bold text-white leading-[1.2] max-w-3xl mx-auto mb-10 drop-shadow-2xl">
              We connect the people who<br/>
              envision, build, and supply —<br/>
              intelligently.
            </h2>
            <Link to="/auth">
              <button className="px-8 py-4 rounded-xl border-2 border-white text-white font-bold tracking-wide hover:bg-white hover:text-[#111] transition-colors duration-300 shadow-2xl">
                How it works &rarr;
              </button>
            </Link>
          </motion.div>
        </section>

        {/* SECTION 3: FEATURES WITH CRANE */}
        <section className="relative bg-background min-h-[800px] py-24 px-6 mt-12 pointer-events-auto overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative">
            
            {/* Title overlay */}
            <div className="absolute top-0 left-0 right-0 text-center z-30 pointer-events-none">
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-muted mb-4">
                ONE PLATFORM. THREE ROLES.
              </div>
            </div>

            {/* Left Column: Floating Cards */}
            <div className="flex-1 flex flex-col gap-12 relative z-20 mt-16 lg:mt-0">
              
              {/* Card 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="bg-surface/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-border/60 max-w-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300 self-start"
              >
                <div className="w-10 h-10 rounded-full bg-[#E8642A]/10 text-[#E8642A] flex items-center justify-center font-bold mb-4">1</div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#E8642A] mb-2">Homeowners</div>
                <h3 className="text-xl font-bold text-[#111] mb-2">Post your project</h3>
                <p className="text-sm text-text-muted leading-relaxed">Describe what you need, set your budget, and get matched with verified professionals instantly.</p>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-surface/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-border/60 max-w-sm transform rotate-1 hover:rotate-0 transition-transform duration-300 self-end mr-8"
              >
                <div className="w-10 h-10 rounded-full bg-[#2B5CE6]/10 text-[#2B5CE6] flex items-center justify-center font-bold mb-4">2</div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#2B5CE6] mb-2">Contractors</div>
                <h3 className="text-xl font-bold text-[#111] mb-2">Win more jobs</h3>
                <p className="text-sm text-text-muted leading-relaxed">Our AI surfaces high-intent projects perfectly tailored to your skills, timeline, and coverage area.</p>
              </motion.div>

            </div>

            {/* Center: Crane Canvas */}
            <div className="flex-1 h-[600px] w-full relative z-10 pointer-events-auto cursor-grab active:cursor-grabbing">
              <Canvas camera={{ position: [0, 2, 12], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-2, 2, 2]} intensity={0.5} color="#2B5CE6" />
                <OrbitControls enableZoom={false} enablePan={false} />
                <CraneModel />
                <Environment preset="city" />
              </Canvas>
            </div>

            {/* Right Column: Floating Cards */}
            <div className="flex-1 flex flex-col gap-12 relative z-20 mt-16 lg:mt-0">
              
              {/* Card 3 */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-surface/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-border/60 max-w-sm transform rotate-2 hover:rotate-0 transition-transform duration-300 self-start ml-8"
              >
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold mb-4">3</div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#10B981] mb-2">Suppliers</div>
                <h3 className="text-xl font-bold text-[#111] mb-2">Reach contractors</h3>
                <p className="text-sm text-text-muted leading-relaxed">Get your materials directly in front of contractors who actively need them for their ongoing projects.</p>
              </motion.div>

              {/* Card 4 */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-surface/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-border/60 max-w-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300 self-end"
              >
                <div className="w-10 h-10 rounded-full bg-[#888880]/10 text-[#888880] flex items-center justify-center font-bold mb-4">4</div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#888880] mb-2">AI Engine</div>
                <h3 className="text-xl font-bold text-[#111] mb-2">Real matching logic</h3>
                <p className="text-sm text-text-muted leading-relaxed">Compatibility scores are dynamically calculated using thousands of data points to ensure the perfect fit.</p>
              </motion.div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
