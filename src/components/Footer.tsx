import React from 'react';
import { Atom, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-xs text-slate-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Atom className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-slate-900 text-sm tracking-tight">FundTheLab</span>
              <p className="text-[11px] text-slate-500">Decentralized Micro-Grants for Breakthrough Science</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-teal-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Gasless via Pollar SDK
            </span>
            <span className="text-slate-300">•</span>
            <span>Stellar Soroban Escrow</span>
            <span className="text-slate-300">•</span>
            <span>100% Open Data & IPFS</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 text-center md:text-right">
            Built for the Pollar Web3 Hackathon 🚀
          </div>

        </div>
      </div>
    </footer>
  );
};
