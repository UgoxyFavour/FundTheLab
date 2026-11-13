import React from 'react';
import { Campaign } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Heart
} from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onSelectCampaign: (campaign: Campaign) => void;
  onQuickDonate: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onSelectCampaign,
  onQuickDonate
}) => {
  const percentFunded = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
  const completedMilestones = campaign.milestones.filter(m => m.status === 'completed').length;
  const inProgressMilestone = campaign.milestones.find(m => m.status === 'in_progress');

  return (
    <div className="web3-card rounded-3xl overflow-hidden flex flex-col justify-between group bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all">
      
      {/* Top Banner & Header */}
      <div className="p-6 bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 relative border-b border-slate-200/70">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-white text-cyan-700 border border-cyan-200 shadow-2xs">
            {campaign.category}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600 font-mono shadow-2xs">
            <Users className="w-3 h-3 text-cyan-600" />
            <span>{campaign.donorCount} Donors</span>
          </div>
        </div>

        <h3 
          onClick={() => onSelectCampaign(campaign)}
          className="text-base font-display font-bold text-slate-900 group-hover:text-cyan-700 transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {campaign.title}
        </h3>

        {/* Researcher & University Tag */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/60">
          <img 
            src={campaign.researcherAvatar} 
            alt={campaign.researcherName} 
            className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/30"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {campaign.researcherName}
              </span>
              {campaign.researcherVerified && (
                <span title="Verified Academic Researcher" className="shrink-0 flex items-center">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{campaign.university}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content & Stats */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white">
        
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-5">
          {campaign.summary}
        </p>

        {/* Milestone Escrow Status */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-5">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="text-slate-700 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Escrow Milestones
            </span>
            <span className="font-mono text-cyan-700 font-bold">
              {completedMilestones}/{campaign.milestones.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {campaign.milestones.map((m) => (
              <div 
                key={m.id}
                className={`h-1.5 rounded-full transition-all ${
                  m.status === 'completed'
                    ? 'bg-emerald-500'
                    : m.status === 'in_progress'
                    ? 'bg-cyan-500 animate-pulse'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {inProgressMilestone && (
            <div className="mt-2.5 text-[10px] text-slate-500 truncate flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-600 shrink-0" />
              <span className="truncate">Active: {inProgressMilestone.title}</span>
            </div>
          )}
        </div>

        {/* Progress Bar with Glowing Head */}
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-sm font-extrabold text-slate-900 font-mono">
              ${campaign.raisedAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">USDC</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {percentFunded}% of ${campaign.targetAmount.toLocaleString()}
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-700"
              style={{ width: `${percentFunded}%` }}
            />
          </div>
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => onSelectCampaign(campaign)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium text-xs border border-slate-200 transition"
          >
            <span>Milestones</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onQuickDonate(campaign)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
          >
            <Heart className="w-3.5 h-3.5 fill-white stroke-none" />
            <span>Donate</span>
          </button>
        </div>

      </div>

    </div>
  );
};
