import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import NetworkBackground from '../components/ui/NetworkNodes';
import ThreeText from '../components/ui/ThreeText';
import { ArrowRight, Shield, Zap, Globe, Lock, BarChart3, Cpu, Layers, Activity } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const [prices, setPrices] = useState([
    { symbol: 'BTC/USDT', price: 'Loading...', change: '...', color: 'text-gray-400' },
    { symbol: 'ETH/USDT', price: 'Loading...', change: '...', color: 'text-gray-400' },
    { symbol: 'USD/IDR', price: '15,820.00', change: '0.05%', color: 'text-green-400' },
  ]);

  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [btcRes, ethRes, fxRes] = await Promise.all([
          fetch('/api/prices/btc'),
          fetch('/api/prices/eth'),
          fetch('/api/prices/usd-idr')
        ]);

        const btcData = await btcRes.json();
        const ethData = await ethRes.json();
        const fxData = await fxRes.json();

        setPrices(prev => prev.map(p => {
          if (p.symbol === 'BTC/USDT') return { ...p, price: parseFloat(btcData.price).toLocaleString(undefined, { minimumFractionDigits: 2 }), color: 'text-cyan-400' };
          if (p.symbol === 'ETH/USDT') return { ...p, price: parseFloat(ethData.price).toLocaleString(undefined, { minimumFractionDigits: 2 }), color: 'text-cyan-400' };
          if (p.symbol === 'USD/IDR') return { ...p, price: parseFloat(fxData.price).toLocaleString(undefined, { minimumFractionDigits: 2 }), color: 'text-cyan-400' };
          return p;
        }));
      } catch (error) {
        console.error('Price fetch error:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-cyan-500/30">
      {/* TOP PRICE TICKER */}
      <div className="relative z-50 w-full bg-black/80 border-b border-cyan-500/20 backdrop-blur-md overflow-hidden py-2">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...tickerData, ...tickerData].map((item, i) => (
            <div key={i} className="flex items-center gap-3 mx-8 text-xs font-mono">
              <span className="text-gray-500">{item.symbol}</span>
              <span className="text-white font-bold">${item.price}</span>
              <span className={parseFloat(item.change) >= 0 ? 'text-green-400' : 'text-red-400'}>
                {parseFloat(item.change) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(item.change)).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-0 -z-10">
        <NetworkBackground />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.jpg" alt="Black IntelliSense Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold tracking-tighter uppercase">Black IntelliSense</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#advantages" className="hover:text-cyan-400 transition-colors">Advantages</a>
          <a href="#security" className="hover:text-cyan-400 transition-colors">zkTLS</a>
          <a href="#platforms" className="hover:text-cyan-400 transition-colors">Platforms</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]/90 -z-10 pointer-events-none" />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Institutional Grade Infrastructure
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="relative text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 drop-shadow-[0_0_25px_rgba(0,242,255,0.6)]"
            >
              <div className="relative inline-block">
                <span className="relative z-10">
                  {"THE DARK POOL".split("").map((char, i) => (
                    <motion.span 
                      key={i} 
                      className="inline-block"
                      whileHover={{ y: -10, color: '#22d3ee', transition: { type: 'spring', stiffness: 300 } }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                  <br />
                  <div className="h-32 lg:h-48 w-full flex items-center justify-center">
                    <ThreeText />
                  </div>
                </span>
                {/* Neon Scanline */}
                <div className="absolute inset-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-scanline z-20 pointer-events-none" />
                {/* Pulse Glow */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl animate-pulse-glow -z-10" />
              </div>
            </motion.h1>
            
            <motion.div variants={itemVariants} className="inline-block p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mb-10 shadow-xl">
              <p className="text-lg text-white max-w-lg leading-relaxed drop-shadow-md font-medium">
                Professional-grade multi-platform trading infrastructure designed for institutional dark pools and OTC trading. Centralized liquidity, precision pricing, and cryptographic security.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <button 
                onClick={onGetStarted}
                className="group px-8 py-4 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Launch Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all text-white">
                Documentation
              </button>
            </motion.div>
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
                {prices.map((pair, i) => (
                  <div key={i} className="h-20 w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-cyan-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-400">
                      {pair.symbol.split('/')[0]}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-xs font-mono text-gray-400 uppercase">{pair.symbol}</div>
                      <div className="text-lg font-bold font-mono text-white">${pair.price}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs font-bold ${pair.color}`}>
                      {pair.change}
                    </div>
                  </div>
                ))}
                <div className="mt-8 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-4">
                  <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                    <div className="text-cyan-400 font-mono text-xs">SYSTEM_STATUS: ACTIVE</div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      LIVE_FEED
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="space-y-1">
                      <div className="text-gray-500 font-mono text-[10px] uppercase">zkTLS Proof</div>
                      <div className="text-xs font-bold text-cyan-400">VERIFIED</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500 font-mono text-[10px] uppercase">Pool Volume</div>
                      <div className="text-xs font-bold text-white">$1.24B</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500 font-mono text-[10px] uppercase">Latency</div>
                      <div className="text-xs font-bold text-white">4.2ms</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500 font-mono text-[10px] uppercase">Node Status</div>
                      <div className="text-xs font-bold text-green-400">STABLE</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-cyan-500/20">
                    <div className="text-2xl font-bold tracking-tight">Liquidity Hub Stable</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-cyan-400/20 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </main>

      {/* Institutional Ecosystem Section */}
      <motion.section 
        id="platforms" 
        style={{ y: cardY }}
        className="relative z-10 max-w-7xl mx-auto px-8 py-32"
      >
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4 uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          >
            Institutional Ecosystem
          </motion.h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            A complete toolset for high-frequency liquidity management and institutional OTC settlement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CapabilityCard 
            title="Liquidity Hub"
            icon={<Layers className="w-6 h-6" />}
            color="text-cyan-400"
            bg="bg-cyan-500/10"
            border="border-cyan-500/30"
            features={["High-Frequency Trading Terminal", "Institutional P2P Desk", "Advanced Order Management", "Multi-Exchange Aggregator"]}
          />
          <CapabilityCard 
            title="Ops Command"
            icon={<Cpu className="w-6 h-6" />}
            color="text-blue-400"
            bg="bg-blue-500/10"
            border="border-blue-500/30"
            features={["Sense50 Admin Dashboard", "Global Command Center", "Dynamic Markup Engine", "Client Risk CRM"]}
          />
          <CapabilityCard 
            title="Settlement Engine"
            icon={<Globe className="w-6 h-6" />}
            color="text-indigo-400"
            bg="bg-indigo-500/10"
            border="border-indigo-500/30"
            features={["Institutional Fiat Gateway", "High-Value Settlement", "Payment Automation", "Secure Asset Onramps"]}
          />
          <CapabilityCard 
            title="Security & Trust"
            icon={<Shield className="w-6 h-6" />}
            color="text-green-400"
            bg="bg-green-500/10"
            border="border-green-500/30"
            features={["zkTLS Zero-Knowledge Proofs", "Identity Attestation", "Solvency Heartbeat", "Immutable Audit Logs"]}
          />
          <CapabilityCard 
            title="Smart Contract Engine"
            icon={<Lock className="w-6 h-6" />}
            color="text-yellow-400"
            bg="bg-yellow-500/10"
            border="border-yellow-500/30"
            features={["Automated Solvency Vaults", "Multisig Asset Approval", "Smart Settlement Logic", "On-Chain Governance"]}
          />
          <CapabilityCard 
            title="Treasury Mgmt"
            icon={<BarChart3 className="w-6 h-6" />}
            color="text-purple-400"
            bg="bg-purple-500/10"
            border="border-purple-500/30"
            features={["Multi-Asset Portfolio Tracking", "Cold/Hot Wallet Integration", "Institutional Price Feeds", "Asset Allocation View"]}
          />
          <CapabilityCard 
            title="Secure Comms"
            icon={<Activity className="w-6 h-6" />}
            color="text-red-400"
            bg="bg-red-500/10"
            border="border-red-500/30"
            features={["Encrypted Client-Broker Chat", "Real-time Notification Hub", "Compliance-Logged Comms", "Secure Request Flow"]}
          />
        </div>
      </motion.section>


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

      {/* Contact Section */}
      <section id="contact" className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              Get in Touch
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Ready to elevate your trading infrastructure? Our institutional specialists are available for consultation and bespoke integration.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-400">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
                <span>Global Support: support@blackintellisense.com</span>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <span>Operational Status: 24/7 Active</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-500 uppercase">Institutional Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 outline-none transition-all"
                    placeholder="name@firm.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-500 uppercase">Message</label>
                <textarea 
                  rows="4" 
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 outline-none transition-all"
                  placeholder="Describe your institutional requirements..."
                />
              </div>
              <button className="w-full py-4 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                Request Consultation
              </button>
            </form>
          </motion.div>
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

const AdvantageCard = ({ icon, title, desc, tag }) => (
  <motion.div 
    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.07)' }}
    className="p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all group shadow-2xl"
  >
    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
      {icon}
    </div>
    <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-2">{tag}</div>
    <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter text-white drop-shadow-md">{title}</h3>
    <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const CapabilityCard = ({ icon, title, color, bg, border, features }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`p-8 rounded-3xl ${bg} ${border} backdrop-blur-xl transition-all group relative overflow-hidden`}
  >
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-6 font-bold border border-white/10 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-6 uppercase tracking-tighter text-white">{title}</h3>
      <ul className="space-y-3">
        {features.map((feat, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
            <div className={`w-1 h-1 rounded-full ${color.replace('text', 'bg')}`} /> {feat}
          </li>
        ))}
      </ul>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-colors" />
  </motion.div>
);

export default LandingPage;
