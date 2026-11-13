import React, { useState } from 'react';
import { Campaign, Category, Milestone } from '../types';
import { 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  onClose,
  onCreate
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Longevity & Bio');
  const [university, setUniversity] = useState('');
  const [labName, setLabName] = useState('');
  const [researcherName, setResearcherName] = useState('');
  const [researcherRole, setResearcherRole] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(3000);
  const [summary, setSummary] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [openAccessCommitment, setOpenAccessCommitment] = useState(
    'All raw datasets will be published to IPFS / Zenodo with open preprint on arXiv / bioRxiv.'
  );

  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; targetPercent: number }>>([
    { title: 'Reagents & Hardware Procurement', description: 'Procure primary reagents and calibrate assay apparatus.', targetPercent: 40 },
    { title: 'Validation Trials & Open Dataset Release', description: 'Execute experimental validation and upload anonymized data to IPFS.', targetPercent: 60 }
  ]);

  const [error, setError] = useState<string | null>(null);

  const totalPercent = milestones.reduce((sum, m) => sum + m.targetPercent, 0);

  const addMilestone = () => {
    if (milestones.length >= 4) return;
    setMilestones([...milestones, { title: 'New Research Milestone', description: 'Deliverable proof details...', targetPercent: 20 }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, val: any) => {
    const updated = [...milestones];
    (updated[index] as any)[field] = val;
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !university || !researcherName || !summary) {
      setError('Please fill out all required fields.');
      return;
    }
    if (totalPercent !== 100) {
      setError(`Milestone allocations must total exactly 100% (currently ${totalPercent}%).`);
      return;
    }

    const calculatedMilestones: Milestone[] = milestones.map((m, idx) => ({
      id: `m-custom-${Date.now()}-${idx}`,
      index: idx + 1,
      title: m.title,
      description: m.description,
      targetPercent: m.targetPercent,
      targetAmount: Math.round((m.targetPercent / 100) * targetAmount),
      status: idx === 0 ? 'in_progress' : 'pending'
    }));

    const mockEscrow = 'G' + Array.from({ length: 55 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('');

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      title,
      category,
      university,
      labName: labName || `${university} Research Group`,
      researcherName,
      researcherRole: researcherRole || 'Lead Researcher',
      researcherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      researcherVerified: true,
      summary,
      fullDescription: fullDescription || summary,
      targetAmount,
      raisedAmount: 0,
      donorCount: 0,
      stellarEscrowAddress: `${mockEscrow.slice(0, 10)}...${mockEscrow.slice(-6)} (Soroban Escrow)`,
      openAccessCommitment,
      milestones: calculatedMilestones,
      tags: [category.split(' ')[0], 'Open Science', 'DeSci'],
      bannerGradient: 'from-cyan-900/60 via-teal-900/40 to-slate-900'
    };

    onCreate(newCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 relative max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-base font-mono"
        >
          ✕
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Academic DeSci Proposal</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Submit a Lab Proposal</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create an open research campaign with milestone-guarded escrow on Stellar.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Open-Source Optical Tweezers for Molecular Biophysics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Field Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition"
              >
                <option value="Longevity & Bio">Longevity & Bio</option>
                <option value="AI & Compute">AI & Compute</option>
                <option value="Clean Energy">Clean Energy</option>
                <option value="Neuroscience">Neuroscience</option>
                <option value="Quantum & Physics">Quantum & Physics</option>
              </select>
            </div>
          </div>

          {/* University & Researcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                University / Institution *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UC Berkeley / Max Planck"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lab / Research Unit Name
              </label>
              <input
                type="text"
                placeholder="e.g. Quantum Photonics Laboratory"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lead Researcher Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Alex Mercer"
                value={researcherName}
                onChange={(e) => setResearcherName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Academic Role
              </label>
              <input
                type="text"
                placeholder="e.g. PhD Candidate / Assistant Prof"
                value={researcherRole}
                onChange={(e) => setResearcherRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition"
              />
            </div>
          </div>

          {/* Funding Target */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Funding Target (USDC) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-16 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-cyan-600 transition"
                min="100"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                USDC
              </span>
            </div>
          </div>

          {/* Abstract / Summary */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Research Abstract / Summary *
            </label>
            <textarea
              required
              rows={2}
              placeholder="What scientific breakthrough will this micro-grant fund?"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition"
            />
          </div>

          {/* Milestones Builder */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-slate-900">Escrow Milestones</span>
                <span className={`ml-2 text-[11px] font-mono font-semibold ${totalPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  (Total: {totalPercent}%)
                </span>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-cyan-800 border border-slate-200 transition flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-white text-slate-700 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-1">
                    {idx + 1}
                  </span>
                  
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder={`Milestone ${idx + 1} Title`}
                      value={m.title}
                      onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                    />
                    <input
                      type="text"
                      placeholder="Expected Deliverable / Open Proof Link"
                      value={m.description}
                      onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div className="w-20 shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="%"
                        value={m.targetPercent}
                        onChange={(e) => updateMilestone(idx, 'targetPercent', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 font-mono text-right pr-6 focus:outline-none focus:border-cyan-600"
                        min="1"
                        max="100"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">%</span>
                    </div>
                  </div>

                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 transition mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Open Science Pledge */}
          <div className="pt-2 border-t border-slate-200">
            <label className="text-xs font-semibold text-teal-800 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Open Science Pledge *
            </label>
            <input
              type="text"
              required
              value={openAccessCommitment}
              onChange={(e) => setOpenAccessCommitment(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-600 transition"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Deploy Soroban Escrow & Publish
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
