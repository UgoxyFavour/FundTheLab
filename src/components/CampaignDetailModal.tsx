import React, { useState } from 'react';
import { Campaign, Milestone } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  FileText, 
  Database, 
  Heart,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CampaignDetailModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDonate: (campaign: Campaign) => void;
  onUpdateMilestoneStatus: (campaignId: string, milestoneId: string) => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  onClose,
  onDonate,
  onUpdateMilestoneStatus
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'escrow'>('milestones');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const percentFunded = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

  const handleVerifyMilestone = async (milestone: Milestone) => {
    setVerifyingId(milestone.id);
    await new Promise(r => setTimeout(r, 1200));
    onUpdateMilestoneStatus(campaign.id, milestone.id);
    setVerifyingId(null);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 via-teal-50/40 to-cyan-50/50 relative border-b border-slate-200">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-mono border border-slate-200 transition shadow-xs"
          >
            ✕
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-white text-cyan-700 border border-cyan-200">
              {campaign.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200">
              {campaign.donorCount} Global Backers
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 leading-snug">
            {campaign.title}
          </h2>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/80">
            <img 
              src={campaign.researcherAvatar} 
              alt={campaign.researcherName} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/30"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">{campaign.researcherName}</span>
                {campaign.researcherVerified && (
                  <span title="Verified Academic Identity" className="shrink-0 flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{campaign.researcherRole}</span>
                <span>•</span>
                <span className="text-cyan-700 font-medium">{campaign.university}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'milestones'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Milestone Escrow ({campaign.milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Research Overview
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'escrow'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Stellar Soroban Contract
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto bg-white">
          
          {/* TAB 1: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-slate-700 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-teal-900">Milestone-Guarded Escrow:</strong> Funds are locked in a Stellar smart escrow. The lab cannot withdraw funds upfront. Each tranche unlocks only upon verifiable milestone proofs.
                </div>
              </div>

              <div className="space-y-3">
                {campaign.milestones.map((m) => {
                  const isCompleted = m.status === 'completed';
                  const isInProgress = m.status === 'in_progress';

                  return (
                    <div 
                      key={m.id}
                      className={`p-4 rounded-2xl border transition ${
                        isCompleted
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : isInProgress
                          ? 'bg-cyan-50/40 border-cyan-300 shadow-sm'
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isInProgress
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isCompleted ? <Unlock className="w-4 h-4" /> : m.status === 'pending' ? <Lock className="w-4 h-4" /> : m.index}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isInProgress
                                  ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {m.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {m.description}
                            </p>

                            {/* Proof links if completed */}
                            {m.proofUrl && (
                              <div className="mt-2.5 flex items-center gap-2 text-xs">
                                <span className="text-slate-500">Verification Proof:</span>
                                <a 
                                  href={m.proofUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-mono text-[11px] underline font-medium"
                                >
                                  {m.proofType || 'Proof Link'}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                {m.releasedAt && (
                                  <span className="text-[10px] text-slate-400">• Released {m.releasedAt}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount & Allocation */}
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm font-bold text-emerald-600">
                            ${m.targetAmount} USDC
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {m.targetPercent}% of Goal
                          </div>

                          {/* Hackathon Interactive Verification Action */}
                          {isInProgress && (
                            <button
                              onClick={() => handleVerifyMilestone(m)}
                              disabled={verifyingId === m.id}
                              className="mt-2 text-[10px] px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {verifyingId === m.id ? 'Releasing...' : 'Verify & Release'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RESEARCH OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Research Summary</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {campaign.fullDescription}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-semibold text-teal-800 flex items-center gap-1.5 mb-1.5">
                  <Database className="w-4 h-4 text-teal-600" />
                  Open Science Commitment
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {campaign.openAccessCommitment}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Research Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-700 border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STELLAR SOROBAN CONTRACT */}
          {activeTab === 'escrow' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono space-y-3">
                <div>
                  <div className="text-slate-500 text-[10px]">ESCROW SMART CONTRACT (STELLAR SOROBAN)</div>
                  <div className="text-cyan-800 font-bold select-all break-all">{campaign.stellarEscrowAddress}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500">Asset:</span> <span className="text-slate-800 font-bold">USDC (Stellar Native)</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Network:</span> <span className="text-emerald-600 font-bold">Stellar Testnet</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Gas Sponsorship:</span> <span className="text-teal-700 font-bold">Pollar Paymaster (0 XLM)</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Escrow Type:</span> <span className="text-slate-700">Multi-Milestone Conditional</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700">
                <h5 className="font-bold text-slate-900 mb-1">How Stellar Escrow Works:</h5>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Donors deposit USDC through Pollar into the campaign's Soroban contract instance.</li>
                  <li>Funds stay immutably locked until a milestone verification call is signed.</li>
                  <li>Researchers receive funds with instant 3-second settlement directly into their Pollar wallet.</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer / Action Bar */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="text-xs text-slate-500 mb-0.5">Total Campaign Funding</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 font-mono">
                ${campaign.raisedAmount.toLocaleString()} USDC
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / ${campaign.targetAmount.toLocaleString()} ({percentFunded}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onDonate(campaign);
              }}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Donate USDC</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
