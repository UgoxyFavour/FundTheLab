import React from 'react';
import { Category } from '../types';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Timer, 
  Percent, 
  Database,
  ArrowRight
} from 'lucide-react';

interface HeroProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalRaised: number;
  totalDonors: number;
  onOpenCreate: () => void;
}

const CATEGORIES: Category[] = [
  'All',
  'Public Health',
  'Agritech & Food',
  'Clean Energy',
  'AI & Compute',
  'Longevity & Bio'
];

const UNIVERSITIES = [
  'University of Ibadan (UI)',
  'University of Lagos (UNILAG)',
  'Obafemi Awolowo Univ (OAU)',
  'Ahmadu Bello Univ (ABU)',
  'Univ of Nigeria Nsukka (UNN)',
  'Covenant University',
  'FUTA Akure',
  'FUNAAB Abeokuta'
];

export const Hero: React.FC<HeroProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalRaised,
  totalDonors,
  onOpenCreate
}) => {
  return (
    <div className="relative pt-12 pb-10 overflow-hidden bg-grid-mesh">
      {/* Background ambient lighting orbs (subtle pastels) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-400/10 via-indigo-400/10 to-teal-400/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Floating Pill Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs text-slate-700 backdrop-blur-xl">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="font-medium">Decentralized Science (DeSci) on Stellar Soroban</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-semibold font-mono">0% Fee Protocol</span>
          </div>
        </div>

        {/* Hero Headline & Value Prop */}
        <div className="text-center mt-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            Direct Micro-Grants for{' '}
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Breakthrough Science
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Empower student researchers and university labs directly in USDC with zero administrative overhead. Protected by milestone-based smart escrow on Stellar and seamless Pollar social onboarding.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('campaigns-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-display font-bold text-sm shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Explore Active Labs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenCreate}
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm transition"
            >
              Submit a Proposal
            </button>
          </div>
        </div>

        {/* University Ticker Bar */}
        <div className="mt-14 pt-6 border-t border-slate-200/80">
          <div className="text-center text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-4">
            Research Labs & Talent From Leading Institutions
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-display font-medium text-slate-500">
            {UNIVERSITIES.map((uni) => (
              <span key={uni} className="hover:text-cyan-700 transition-colors flex items-center gap-1.5 cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60"></span>
                {uni}
              </span>
            ))}
          </div>
        </div>

        {/* Bento Grid Impact Metrics Cards (Clean White Theme) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
          
          <div className="web3-card p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span>Total Micro-Grants</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ${totalRaised.toLocaleString()} <span className="text-xs text-cyan-700 font-sans font-bold">USDC</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">From {totalDonors} global supporters</div>
          </div>

          <div className="web3-card p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span>Overhead Deducted</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
              0% <span className="text-xs text-slate-400 line-through font-normal">vs 45%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">100% directly to research</div>
          </div>

          <div className="web3-card p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Timer className="w-4 h-4 text-indigo-600" />
              <span>Time to Funding</span>
            </div>
            <div className="text-3xl font-extrabold text-indigo-700 font-mono tracking-tight">
              4 Days <span className="text-xs text-slate-400 line-through font-normal">vs 9 Mo.</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Bypassing grant bureaucracy</div>
          </div>

          <div className="web3-card p-5 rounded-3xl relative overflow-hidden group">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <Database className="w-4 h-4 text-teal-600" />
              <span>Open Science</span>
            </div>
            <div className="text-3xl font-extrabold text-teal-700 font-mono tracking-tight">
              100% Open
            </div>
            <div className="text-[11px] text-slate-400 mt-1">IPFS datasets & open preprints</div>
          </div>

        </div>

        {/* Search & Filter Bar */}
        <div id="campaigns-section" className="mt-14 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/20 font-bold scale-[1.02]'
                        : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lab, uni, or keyword..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition shadow-sm"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
