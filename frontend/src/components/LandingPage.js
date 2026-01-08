import React from 'react';
import { 
  TrendingUp, Brain, GraduationCap, BarChart3, 
  Shield, Zap, UserPlus, Wallet, LineChart, 
  Trophy, Mail, MapPin, ArrowRight, 
  Play, Sparkles
} from "lucide-react";

const LandingPage = ({ onStart }) => {
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

      {/* 2. STICKY NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020804]/80 backdrop-blur-xl border-b border-[#00ff7f10]">
        <div className="container mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            {/* BOX ICON REMOVED AS REQUESTED */}
            <div style={styles.brandTextWrapper}>
              <div style={styles.brandMainText}>
                <span className="text-white">LANKA</span>
                <span className="text-[#00ff7f] ml-1">STOCKS</span>
              </div>
              <span style={styles.brandSubText}>PLUS+</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <a href="#home" className="hover:text-[#00ff7f] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#00ff7f] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#00ff7f] transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-4">
            {/* LOGIN BUTTON FIXED TO GO TO LOGIN PAGE */}
            <button onClick={onStart} className="hidden lg:block text-sm font-black uppercase hover:text-[#00ff7f] transition">Login</button>
            <button onClick={onStart} className="bg-[#00ff7f] text-black px-8 py-3 rounded-full font-black uppercase text-xs hover:shadow-[0_0_30px_rgba(0,255,127,0.5)] transition-all active:scale-95">
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
              <span className="text-[10px] font-black text-[#00ff7f] uppercase tracking-widest">Next-Gen Trading Simulation</span>
            </div>
            <h1 className="text-6xl lg:text-[100px] font-black leading-[0.9] tracking-tighter uppercase">
              TRADE <span className="text-[#00ff7f]">SMART</span><br/>LEARN FAST.
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl max-w-xl leading-relaxed">
              Experience the Colombo Stock Exchange like never before. AI-driven insights, real-time data, and LKR 1M virtual cash to kickstart your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button onClick={onStart} className="px-10 py-5 bg-[#00ff7f] text-black font-black rounded-2xl hover:scale-105 transition shadow-[0_0_50px_rgba(0,255,127,0.4)] flex items-center justify-center gap-3 uppercase text-sm">
                Open Free Account <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 font-bold rounded-2xl hover:bg-white/10 transition flex items-center justify-center gap-3 uppercase text-sm">
                <Play className="w-5 h-5 text-[#00ff7f]" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Floating Dashboard - Exactly like design 1.png */}
          <div className="relative lg:block hidden group animate-float">
            <div className="absolute -inset-4 bg-[#00ff7f20] rounded-[50px] blur-3xl opacity-50" />
            <div className="relative bg-[#0a120b] p-10 rounded-[48px] border border-[#00ff7f30] shadow-2xl">
               <div className="flex justify-between items-center mb-12 text-left">
                  <div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Assets</p>
                    <h3 className="text-4xl font-black tracking-tight text-white">LKR 2,450,000</h3>
                  </div>
                  <div className="text-[#00ff7f] font-black bg-[#00ff7f10] px-4 py-2 rounded-xl text-sm border border-[#00ff7f30]">+12.5%</div>
               </div>
               <div className="flex items-end gap-3 h-48 mb-12">
                  {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85].map((h, i) => (
                    <div key={i} style={{height: `${h}%`}} className="flex-1 bg-gradient-to-t from-[#00ff7f05] to-[#00ff7f] rounded-t-xl" />
                  ))}
               </div>
               <div className="grid grid-cols-3 gap-6">
                  <div className="bg-black/40 p-5 rounded-3xl border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1">Stocks</p><p className="font-black text-[#00ff7f]">12</p></div>
                  <div className="bg-black/40 p-5 rounded-3xl border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1">AI Score</p><p className="font-black text-[#00ff7f]">87%</p></div>
                  <div className="bg-black/40 p-5 rounded-3xl border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1">Rank</p><p className="font-black text-[#00ff7f]">#04</p></div>
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
      <section className="py-24 border-y border-[#00ff7f15] bg-[#00ff7f05]">
        <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <StatItem value="50K+" label="Active Traders" />
          <StatItem value="LKR 10B+" label="Trade Volume" />
          <StatItem value="300+" label="CSE Stocks" />
          <StatItem value="95%" label="User Success" />
        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="features" className="py-32 container mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
          <div className="inline-block px-5 py-2 rounded-full bg-[#00ff7f08] border border-[#00ff7f20] text-[#00ff7f] text-[10px] font-black uppercase tracking-widest">Core Features</div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight uppercase">Everything You Need to <span className="text-[#00ff7f]">Trade Smarter</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">Our AI-powered platform gives you the tools, knowledge, and confidence to navigate the CSE.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard icon={<Brain />} title="AI Sentiment Analysis" desc="We scan news and social media to predict stock movements before they happen." />
          <FeatureCard icon={<LineChart />} title="Real-Time Engine" desc="Zero-latency data streaming directly from the Colombo Stock Exchange servers." />
          <FeatureCard icon={<Shield />} title="Safe Environment" desc="Practice your wildest strategies with virtual cash without losing a single cent." />
          <FeatureCard icon={<GraduationCap />} title="Masterclass Courses" desc="Go from a beginner to a market expert with our structured learning paths." />
          <FeatureCard icon={<BarChart3 />} title="Deep Analytics" desc="Professional grade heatmaps, candle charts, and portfolio breakdowns." />
          <FeatureCard icon={<Zap />} title="Instant Orders" desc="Execute complex market and limit orders with the click of a button." />
        </div>
      </section>

      {/* 6. HOW IT WORKS (4 STEPS) */}
      <section id="how-it-works" className="py-32 bg-black/40">
        <div className="container mx-auto px-6">
          <h2 className="text-5xl lg:text-6xl font-black mb-24 text-center uppercase tracking-tighter">Start in <span className="text-[#00ff7f]">4 Simple Steps</span></h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepItem num="01" icon={<UserPlus />} title="Register" desc="Create your profile in 30 seconds and access the CSE dashboard." />
            <StepItem num="02" icon={<Wallet />} title="Virtual Funds" desc="Receive LKR 1,000,000 in virtual money to start your journey." />
            <StepItem num="03" icon={<TrendingUp />} title="Trade" desc="Pick and buy stocks from 300+ CSE companies with real-time data." />
            <StepItem num="04" icon={<Trophy />} title="Grow" desc="Follow AI signals, analyze trades, and build your market ranking." />
          </div>
        </div>
      </section>

      {/* 7. FULL FOOTER SECTION */}
      <footer className="py-24 border-t border-[#00ff7f20] bg-black/80 px-6 backdrop-blur-md">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 lg:gap-16">
          {/* Brand Col */}
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-2 mb-4 text-left">
              {/* BRAND LOGO DESIGN UPDATED IN FOOTER AS WELL */}
              <div style={styles.brandTextWrapper}>
                <div style={styles.brandMainText}>
                  <span className="text-white">LANKA</span>
                  <span className="text-[#00ff7f] ml-1">STOCKS</span>
                </div>
                <span style={styles.brandSubText}>PLUS+</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs text-left">
              AI-powered virtual trading platform for the Colombo Stock Exchange. Learn, practice, and master stock trading risk-free.
            </p>
            <div className="space-y-4 text-sm text-gray-400 text-left">
              <div className="flex items-center gap-3 font-medium"><Mail size={16} className="text-[#00ff7f]" /> hello@lankastocksplus.com</div>
              <div className="flex items-center gap-3 font-medium"><MapPin size={16} className="text-[#00ff7f]" /> Colombo, Sri Lanka</div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-black text-white mb-8 uppercase text-xs tracking-widest text-[#00ff7f]">Product</h4>
            <ul className="text-gray-500 space-y-4 text-sm font-bold">
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Features</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">API</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Documentation</li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-black text-white mb-8 uppercase text-xs tracking-widest text-[#00ff7f]">Company</h4>
            <ul className="text-gray-500 space-y-4 text-sm font-bold">
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Press</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Blog</li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-black text-white mb-8 uppercase text-xs tracking-widest text-[#00ff7f]">Support</h4>
            <ul className="text-gray-500 space-y-4 text-sm font-bold">
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Contact Us</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Tutorials</li>
              <li className="hover:text-[#00ff7f] cursor-pointer transition-colors">Community</li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-black text-white mb-8 uppercase text-xs tracking-widest text-[#00ff7f]">Legal</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li className="text-gray-500 hover:text-[#00ff7f] cursor-pointer transition-colors">Privacy Policy</li>
              <li className="text-gray-500 hover:text-[#00ff7f] cursor-pointer transition-colors">Terms of Service</li>
              <li className="text-gray-500 hover:text-[#00ff7f] cursor-pointer transition-colors">Disclaimer</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="container mx-auto text-center mt-24 pt-10 border-t border-[#00ff7f10] text-[10px] font-black uppercase text-gray-600 tracking-[0.3em]">
          © 2026 LANKA STOCKS PLUS. ALL RIGHTS RESERVED. FINAL YEAR PROJECT BY SUBVASAN BALASUNTHARAM.
        </div>
      </footer>
    </div>
  );
};

// HELPER COMPONENTS (Do not delete these)
const StatItem = ({ value, label }) => (
  <div className="group">
    <div className="text-5xl lg:text-7xl font-black text-[#00ff7f] tracking-tighter drop-shadow-[0_0_20px_rgba(0,255,127,0.3)] group-hover:scale-105 transition-transform">{value}</div>
    <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-12 rounded-[40px] bg-[#0a120b] border border-[#00ff7f15] hover:border-[#00ff7f60] transition-all duration-500 hover:-translate-y-3 shadow-2xl">
    <div className="w-20 h-20 rounded-3xl bg-[#00ff7f10] text-[#00ff7f] flex items-center justify-center mb-10 group-hover:shadow-[0_0_20px_rgba(0,255,127,0.1)]">
      {React.cloneElement(icon, { size: 36 })}
    </div>
    <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">{title}</h3>
    <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

const StepItem = ({ num, icon, title, desc }) => (
  <div className="relative p-10 bg-[#0a120b] rounded-[40px] border border-[#00ff7f10] hover:border-[#00ff7f40] transition-all group">
    <div className="text-8xl font-black text-[#00ff7f05] absolute top-6 right-8">{num}</div>
    <div className="w-16 h-16 bg-[#00ff7f15] text-[#00ff7f] rounded-2xl flex items-center justify-center mb-8 border border-[#00ff7f20] group-hover:bg-[#00ff7f25] transition-colors">{icon}</div>
    <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

export default LandingPage;