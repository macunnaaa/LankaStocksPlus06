import React, { useState } from 'react';
import { 
  TrendingUp, Brain, GraduationCap, BarChart3, 
  Shield, Zap, UserPlus, Wallet, LineChart, 
  Trophy, Mail, MapPin, ArrowRight, 
  Play, Sparkles, Phone, Globe, Facebook, Linkedin, Instagram, Youtube, Twitter
} from "lucide-react";

const LandingPage = ({ onStart }) => {
  // --- FORM STATES FOR CONTACT ---
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Gmail integration ready logic
    window.location.href = `mailto:hello@lankastocksplus.com?subject=Contact from ${formData.name}&body=${formData.message} (From: ${formData.email})`;
    setStatus('Redirecting to your Mail app...');
  };

  // Inline styles for the specific brand logo design
  const styles = {
    brandTextWrapper: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: '1',
      marginLeft: '8px'
    },
    brandMainText: {
      fontSize: '18px',
      fontWeight: '900',
      letterSpacing: '1px'
    },
    brandSubText: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#f0b90b',
      letterSpacing: '2px'
    }
  };

  return (
    <div className="min-h-screen bg-[#020804] text-white overflow-x-hidden selection:bg-[#00ff7f] selection:text-black font-sans scroll-smooth">
      
      {/* 1. BACKGROUND GLOW EFFECTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00ff7f15] blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-[#00ff7f10] blur-[100px] rounded-full" />
      </div>

      {/* 2. STICKY NAVBAR (ATrad Inspired) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020804]/90 backdrop-blur-xl border-b border-[#00ff7f10]">
        <div className="container mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            {/* SRI LANKAN FLAG ICON ADDED */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
               <span className="text-[14px]">🇱🇰</span>
               <span className="text-[10px] font-black tracking-widest text-gray-300 uppercase hidden sm:block">Sri Lanka</span>
            </div>
            
            <div style={styles.brandTextWrapper}>
              <div style={styles.brandMainText}>
                <span className="text-white">LANKA</span>
                <span className="text-[#00ff7f] ml-1">STOCKS</span>
              </div>
              <span style={styles.brandSubText}>PLUS+</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <a href="#home" className="hover:text-[#00ff7f] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#00ff7f] transition-colors">Trade Suite</a>
            
            {/* NEW NEWS & EVENTS LINK - OPENS IN NEW TAB */}
            <a 
              href="https://www.cse.lk/pages/market-news/market-news.component.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#00ff7f] transition-colors text-[#f0b90b]"
            >
              News & Events <ArrowRight size={10} />
            </a>
            
            <a href="#how-it-works" className="hover:text-[#00ff7f] transition-colors">Knowledge Hub</a>
            <a href="#contact" className="hover:text-[#00ff7f] transition-colors">Contact Us</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onStart} className="hidden lg:block text-xs font-black uppercase hover:text-[#00ff7f] transition tracking-widest">Login</button>
            <button onClick={onStart} className="bg-[#00ff7f] text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:shadow-[0_0_30px_rgba(0,255,127,0.5)] transition-all active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section id="home" className="relative min-h-screen pt-32 flex items-center justify-center">
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center text-left">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#00ff7f10] border border-[#00ff7f30]">
              <Sparkles className="w-4 h-4 text-[#00ff7f]" />
              <span className="text-[10px] font-black text-[#00ff7f] uppercase tracking-widest text-left">Powering Sri Lankan Capital Markets</span>
            </div>
            <h1 className="text-6xl lg:text-[90px] font-black leading-[0.85] tracking-tighter uppercase">
              The Digital <span className="text-[#00ff7f]">Gateway</span><br/>To CSE Trading.
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl max-w-xl leading-relaxed">
              Trusted by thousands of Sri Lankan investors. Experience high-speed order execution and institutional-grade analytics in a risk-free simulator.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button onClick={onStart} className="px-10 py-5 bg-[#00ff7f] text-black font-black rounded-2xl hover:scale-105 transition shadow-[0_0_50px_rgba(0,255,127,0.4)] flex items-center justify-center gap-3 uppercase text-sm">
                Open Free Account <ArrowRight className="w-5 h-5" />
              </button>
              {/* Play Icon Used */}
              <button className="px-10 py-5 bg-white/5 border border-white/10 font-bold rounded-2xl hover:bg-white/10 transition flex items-center justify-center gap-3 uppercase text-sm">
                <Play size={18} className="text-[#00ff7f]" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Floating Dashboard - ATrad Style Analytics */}
          <div className="relative lg:block hidden group animate-float">
            <div className="absolute -inset-4 bg-[#00ff7f20] rounded-[50px] blur-3xl opacity-50" />
            <div className="relative bg-[#0a120b] p-10 rounded-[48px] border border-[#00ff7f30] shadow-2xl">
               <div className="flex justify-between items-center mb-12 text-left">
                 <div>
                   <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Portfolio Balance</p>
                   <h3 className="text-4xl font-black tracking-tight text-white">LKR 1,000,000</h3>
                 </div>
                 <div className="text-[#00ff7f] font-black bg-[#00ff7f10] px-4 py-2 rounded-xl text-sm border border-[#00ff7f30]">ACTIVE</div>
               </div>
               <div className="flex items-end gap-3 h-48 mb-12">
                 {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85].map((h, i) => (
                   <div key={i} style={{height: `${h}%`}} className="flex-1 bg-gradient-to-t from-[#00ff7f05] to-[#00ff7f] rounded-t-xl" />
                 ))}
               </div>
               <div className="grid grid-cols-3 gap-6">
                  <div className="bg-black/40 p-5 rounded-3xl border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1">Trades</p><p className="font-black text-[#00ff7f]">248</p></div>
                  <div className="bg-black/40 p-5 rounded-3xl border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1">Growth</p><p className="font-black text-[#00ff7f]">+14%</p></div>
                  <div className="bg-black/40 p-5 rounded-3xl border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1">Accuracy</p><p className="font-black text-[#00ff7f]">92%</p></div>
               </div>
            </div>
            {/* AI Signal pop-up */}
            <div className="absolute -top-10 -right-10 bg-[#0a120b] border border-[#00ff7f] p-6 rounded-[30px] shadow-2xl flex items-center gap-4 animate-bounce text-left">
              <div className="w-12 h-12 bg-[#00ff7f] rounded-2xl flex items-center justify-center text-black"><Brain size={24} /></div>
              <div>
                <p className="text-[10px] text-[#00ff7f] font-black uppercase tracking-widest">AI Market Signal</p>
                <p className="font-bold text-white text-xs">Buy Alert: DIAL.N</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="py-24 border-y border-[#00ff7f15] bg-[#00ff7f05] relative z-10 text-center">
        <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 uppercase">
          <StatItem value="250+" label="Market Entities" />
          <StatItem value="99.9%" label="Engine Uptime" />
          <StatItem value="Real-Time" label="Data Stream" />
          <StatItem value="Zero" label="Capital Risk" />
        </div>
      </section>

      {/* 5. PRODUCT FEATURES */}
      <section id="features" className="py-32 container mx-auto px-6 relative z-10 text-center">
        <div className="mb-24 space-y-4">
          <div className="inline-block px-5 py-2 rounded-full bg-[#00ff7f08] border border-[#00ff7f20] text-[#00ff7f] text-[10px] font-black uppercase tracking-widest">Solutions</div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight uppercase">Advanced <span className="text-[#00ff7f]">Trade Engine</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">Integrated with proprietary AI sentiment analysis and CSE live feeds for an elite trading experience.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard icon={<Brain />} title="AI Sentiment" desc="NLP-powered news analysis that detects market shifts across Sri Lankan financial media." />
          {/* BarChart3 & LineChart Used here together to fix warning */}
          <FeatureCard icon={<div className="flex gap-2"><LineChart size={28}/><BarChart3 size={28}/></div>} title="Pro Analytics" desc="Advanced Line Charts, heatmaps, and institutional grade technical candle charts." />
          <FeatureCard icon={<Shield />} title="Safe Environment" desc="Practice your strategies with virtual cash without losing a single cent." />
          <FeatureCard icon={<GraduationCap />} title="Knowledge Portal" desc="Comprehensive tutorials on stock fundamental and technical analysis for SL markets." />
          <FeatureCard icon={<Globe />} title="Global Integration" desc="Direct data streaming bridge from CSE servers to your personal dashboard." />
          <FeatureCard icon={<Zap />} title="Instant Orders" desc="Experience T+2 settlement cycles and virtual portfolio rebalancing automatically." />
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-black/40 relative z-10 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl lg:text-6xl font-black mb-24 uppercase tracking-tighter">Your Journey <span className="text-[#00ff7f]">Begins Here</span></h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepItem num="01" icon={<UserPlus />} title="Onboarding" desc="Quick KYC-free registration to get your virtual trade credentials." />
            <StepItem num="02" icon={<Wallet />} title="Liquidity" desc="Instant credit of LKR 1,000,000 virtual capital to your wallet." />
            <StepItem num="03" icon={<TrendingUp />} title="Trade CSE" desc="Browse the market and execute buy/sell orders in real-time." />
            <StepItem num="04" icon={<Trophy />} title="Leaderboard" desc="Compete with top SL traders and earn the 'Master Trader' badge." />
          </div>
        </div>
      </section>

      {/* 6.5 CONTACT SECTION */}
      <section id="contact" className="py-32 container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 text-left">
            <h2 className="text-5xl lg:text-7xl font-black uppercase leading-none">Get In <span className="text-[#00ff7f]">Touch</span></h2>
            <p className="text-gray-400 text-lg">Have questions about Lanka Stocks Plus? Our team is here to help you navigate your trading education journey.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#00ff7f10] rounded-2xl flex items-center justify-center text-[#00ff7f]"><Phone size={24}/></div>
                <div><p className="text-xs font-black text-gray-500 uppercase">Call Support</p><p className="font-bold">+94 11 234 5678</p></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#00ff7f10] rounded-2xl flex items-center justify-center text-[#00ff7f]"><Mail size={24}/></div>
                <div><p className="text-xs font-black text-gray-500 uppercase">Email Us</p><p className="font-bold">hello@lankastocksplus.com</p></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#00ff7f10] rounded-2xl flex items-center justify-center text-[#00ff7f]"><MapPin size={24}/></div>
                <div><p className="text-xs font-black text-gray-500 uppercase">Location</p><p className="font-bold">Colombo, Sri Lanka</p></div>
              </div>
            </div>
          </div>
          <form onSubmit={handleContactSubmit} className="bg-[#0a120b] p-10 rounded-[40px] border border-[#00ff7f20] space-y-6 text-left">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Name</label>
                <input required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#00ff7f] transition-all outline-none" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Email</label>
                <input required value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-[#00ff7f] transition-all outline-none" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Message</label>
              <textarea required value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 h-32 focus:border-[#00ff7f] transition-all outline-none resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full py-5 bg-[#00ff7f] text-black font-black rounded-2xl uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all">Send Message via Gmail</button>
            {status && <p className="text-center text-[#00ff7f] text-xs font-bold mt-4">{status}</p>}
          </form>
        </div>
      </section>

      {/* 7. FULL FOOTER SECTION */}
      <footer className="py-24 border-t border-[#00ff7f20] bg-[#020804] px-6 relative z-10 text-left">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div style={styles.brandTextWrapper} className="ml-0">
              <div style={styles.brandMainText}>
                <span className="text-white">LANKA</span>
                <span className="text-[#00ff7f] ml-1">STOCKS</span>
              </div>
              <span style={styles.brandSubText}>PLUS+</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs uppercase font-bold tracking-tighter">
              Empowering Sri Lankan investors through elite market simulation and AI data insights.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:text-[#00ff7f] transition-colors cursor-pointer"><Facebook size={18}/></div>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:text-[#00ff7f] transition-colors cursor-pointer"><Linkedin size={18}/></div>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:text-[#00ff7f] transition-colors cursor-pointer"><Instagram size={18}/></div>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:text-[#00ff7f] transition-colors cursor-pointer"><Twitter size={18}/></div>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:text-[#00ff7f] transition-colors cursor-pointer"><Youtube size={18}/></div>
            </div>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 uppercase text-[10px] tracking-[0.2em] text-[#00ff7f]">Trading Suite</h4>
            <ul className="text-gray-500 space-y-4 text-xs font-black uppercase tracking-widest">
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Market Watch</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Order Book</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">AI Analysis</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 uppercase text-[10px] tracking-[0.2em] text-[#00ff7f]">Education</h4>
            <ul className="text-gray-500 space-y-4 text-xs font-black uppercase tracking-widest">
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Trading 101</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Tutorials</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">SEC Rules</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 uppercase text-[10px] tracking-[0.2em] text-[#00ff7f]">Support</h4>
            <ul className="text-gray-500 space-y-4 text-xs font-black uppercase tracking-widest">
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 uppercase text-[10px] tracking-[0.2em] text-[#00ff7f]">Legal</h4>
            <ul className="text-gray-500 space-y-4 text-xs font-black uppercase tracking-widest">
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Terms</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Compliance</li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto text-center mt-24 pt-10 border-t border-[#00ff7f10] text-[10px] font-black uppercase text-gray-700 tracking-[0.3em]">
          © 2026 LANKA STOCKS PLUS. FINAL YEAR PROJECT BY SUBVASAN BALASUNTHARAM.
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

// HELPER COMPONENTS
const StatItem = ({ value, label }) => (
  <div className="group">
    <div className="text-5xl font-black text-[#00ff7f] tracking-tighter drop-shadow-[0_0_20px_rgba(0,255,127,0.3)] group-hover:scale-105 transition-transform">{value}</div>
    <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-10 rounded-[40px] bg-[#0a120b] border border-[#00ff7f10] hover:border-[#00ff7f60] transition-all duration-500 hover:-translate-y-3 shadow-2xl text-left">
    <div className="w-16 h-16 rounded-2xl bg-[#00ff7f08] text-[#00ff7f] flex items-center justify-center mb-8 group-hover:bg-[#00ff7f] group-hover:text-black transition-all">
      {typeof icon === 'object' && icon.props ? icon : React.cloneElement(icon, { size: 28 })}
    </div>
    <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">{title}</h3>
    <div className="text-gray-500 text-sm leading-relaxed font-bold tracking-tight">{desc}</div>
  </div>
);

const StepItem = ({ num, icon, title, desc }) => (
  <div className="relative p-10 bg-white/5 rounded-[40px] border border-white/5 hover:border-[#00ff7f40] transition-all group text-left">
    <div className="text-7xl font-black text-[#00ff7f05] absolute top-6 right-8">{num}</div>
    <div className="w-14 h-14 bg-[#00ff7f10] text-[#00ff7f] rounded-xl flex items-center justify-center mb-8 border border-[#00ff7f10]">{icon}</div>
    <h3 className="text-lg font-black mb-4 uppercase tracking-tighter">{title}</h3>
    <p className="text-gray-500 text-xs leading-relaxed font-bold">{desc}</p>
  </div>
);

export default LandingPage;