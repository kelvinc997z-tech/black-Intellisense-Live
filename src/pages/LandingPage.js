import React from 'react';
import { motion } from 'framer-motion';
import NetworkBackground from '../components/ui/NetworkNodes';
import { ArrowRight, Shield, Zap, Globe, Lock } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-cyan-500/30">
      <NetworkBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#020617] rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase">Black IntelliSense</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Infrastructure</a>
          <a href="#security" className="hover:text-cyan-400 transition-colors">zkTLS Security</a>
          <a href="#platforms" className="hover:text-cyan-400 transition-colors">Platforms</a>
          <button 
            onClick={onGetStarted}
            className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 rounded-full hover:bg-cyan-500/20 transition-all"
          >
            Client Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32">
        {/* Subtle overlay to ensure text readability against 3D background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-transparent to-[#020617]/80 -z-10 pointer-events-none" />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Institutional Grade Infrastructure
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]">
              THE DARK POOL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">EVOLVED.</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg mb-10 leading-relaxed drop-shadow-sm">
              Professional-grade multi-platform trading infrastructure designed for institutional dark pools and OTC trading. Centralized liquidity, precision pricing, and cryptographic security.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onGetStarted}
                className="group px-8 py-4 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Launch Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all text-white">
                Documentation
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square relative rounded-3xl border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-600/20" />
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="h-4 w-32 bg-white/10 rounded-full" />
                  <div className="h-4 w-16 bg-cyan-500/40 rounded-full" />
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 bg-white/20 rounded-full" />
                      <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-6 w-12 bg-cyan-500/40 rounded-lg" />
                  </div>
                ))}
                <div className="mt-8 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="text-cyan-400 font-mono text-xs mb-2">SYSTEM_STATUS: ACTIVE</div>
                  <div className="text-2xl font-bold">Liquidity Hub Stable</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-cyan-400/20 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent -z-10" />
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            Infrastructure
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed drop-shadow-md">
            The complete ecosystem for institutional asset management and high-frequency OTC settlement.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Globe className="w-6 h-6" />} 
            title="Centralized API" 
            desc="The core engine handling authentication, exchange connectivity, and order matching across all roles." 
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />} 
            title="Sense50 Admin" 
            desc="High-performance dashboard for Market Makers to configure markups and manage counterparty requests." 
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6" />} 
            title="IntelliTrade" 
            desc="Streamlined counterparty interface for OTC orders, portfolio tracking, and secure institutional chat." 
          />
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 bg-white/[0.02] border-y border-white/5 backdrop-blur-md py-32">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-video bg-black border border-cyan-500/30 rounded-2xl overflow-hidden p-4 font-mono text-xs text-cyan-400 shadow-inner">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-1">
                <p>{`> Initializing zkTLS Handshake...`}</p>
                <p>{`> Verifying Bank Proof... [SUCCESS]`}</p>
                <p>{`> Cryptographic Attestation: 0x7f...a1`}</p>
                <p>{`> Verifying on-chain transaction...`}</p>
                <p className="text-white">{`> Settlement Confirmed: 1,250,000 USDT`}</p>
                <p className="animate-pulse">_</p>
              </div>
            </div>
            <div className="absolute -z-10 inset-0 bg-cyan-500/10 blur-3xl" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4">
              <Lock className="w-4 h-4" /> Privacy-Preserving
            </div>
            <h2 className="text-4xl font-bold mb-6 uppercase tracking-tighter">zkTLS Verification</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Our internal settlement system utilizes zkTLS (via Reclaim Protocol) to ensure maximum privacy. 
              Verify bank transfers and on-chain movements without exposing sensitive account credentials.
            </p>
            <ul className="space-y-4">
              {['Direct Settlement', 'Zero Third-Party Fees', 'Cryptographic Proof of Funds'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-8 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-xs uppercase tracking-widest">
        <div>© 2026 Black IntelliSense. All rights reserved.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:bg-black/60 transition-all group shadow-2xl">
    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter text-white drop-shadow-md">{title}</h3>
    <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
