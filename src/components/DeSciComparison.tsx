import React from 'react';
import { 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  Zap
} from 'lucide-react';

interface DeSciComparisonProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const DeSciComparison: React.FC<DeSciComparisonProps> = ({ onClose, isModal = false }) => {
  const content = (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs text-cyan-800 font-mono font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          The DeSci Advantage
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Why FundTheLab vs Traditional Grants?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
          Decentralized Science dismantles the gatekeepers of academic research funding using Stellar's instant payment rails and Pollar's frictionless onboarding.
        </p>
      </div>

      {/* Comparison Grid (Clean White Bento Box) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        
        {/* Legacy Model Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-50/40 border border-red-200 space-y-5 relative">
          <div className="flex items-center gap-2.5 pb-4 border-b border-red-100 text-red-600 font-display font-bold text-base">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Legacy Institutional Grants (NIH / NSF)</span>
          </div>

          <ul className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-red-500 shrink-0 font-bold text-sm">✕</span>
              <div>
                <strong className="text-slate-900">6 to 18 Month Review Cycles:</strong> By the time a committee reviews an application, the research questions and market windows have passed.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 shrink-0 font-bold text-sm">✕</span>
              <div>
                <strong className="text-slate-900">30% to 50% University Overhead:</strong> Institutional administrations automatically skim almost half of incoming funds for indirect costs.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 shrink-0 font-bold text-sm">✕</span>
              <div>
                <strong className="text-slate-900">Neglects Micro-Grants ($500–$5k):</strong> Students needing basic reagents or GPU compute are locked out of institutional pools.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 shrink-0 font-bold text-sm">✕</span>
              <div>
                <strong className="text-slate-900">Paywalled Knowledge:</strong> Publicly-funded science ends up trapped behind $35+ Elsevier/Nature publisher paywalls.
              </div>
            </li>
          </ul>
        </div>

        {/* FundTheLab Model Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cyan-50/40 border border-cyan-300 shadow-sm space-y-5 relative overflow-hidden">
          <div className="flex items-center gap-2.5 pb-4 border-b border-cyan-200 text-cyan-800 font-display font-bold text-base">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-cyan-600" />
            <span>FundTheLab on Stellar & Pollar</span>
          </div>

          <ul className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-cyan-600 shrink-0 font-bold text-sm">✓</span>
              <div>
                <strong className="text-slate-900">Instant Global Crowdfunding:</strong> Open proposals immediately accessible to alumni, philanthropists, and patient groups worldwide.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600 shrink-0 font-bold text-sm">✓</span>
              <div>
                <strong className="text-slate-900">0% Bureaucracy / Direct Payout:</strong> 100% of donor USDC flows straight to the lab without administrative skims.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600 shrink-0 font-bold text-sm">✓</span>
              <div>
                <strong className="text-slate-900">Milestone-Guarded Escrow:</strong> Smart contracts hold funds safely, releasing tranches upon public proof submissions.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-600 shrink-0 font-bold text-sm">✓</span>
              <div>
                <strong className="text-slate-900">100% Open Access:</strong> Donors mandate raw datasets on IPFS and preprint articles before final milestone release.
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Stellar & Pollar Technology Highlight */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-5 text-xs">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-600/20">
          <Zap className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <div className="font-display font-bold text-slate-900 text-sm">Why Stellar & Pollar?</div>
          <p className="text-slate-600 leading-relaxed">
            Unlike Ethereum where $15 gas fees destroy micro-donations, <strong>Stellar</strong> processes transactions in 3 seconds for under $0.0001. <strong>Pollar</strong> removes crypto barriers entirely, letting donors sign in with Google and sponsor network fees gaslessly.
          </p>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
        <div className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative my-8">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-base font-mono"
            >
              ✕
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
      {content}
    </div>
  );
};
