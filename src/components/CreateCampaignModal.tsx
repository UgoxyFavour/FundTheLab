import React, { useState } from 'react';
import { Campaign, Category, Milestone } from '../types';
import { 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileText
} from 'lucide-react';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  onClose,
  onCreate
}) => {
  // Wizard Step: 1 = Credentials, 2 = Proposal, 3 = Milestones, 4 = Deploy
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [university, setUniversity] = useState('');
  const [labName, setLabName] = useState('');
  const [researcherName, setResearcherName] = useState('');
  const [researcherRole, setResearcherRole] = useState('');
  const [eduEmail, setEduEmail] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Public Health');
  const [targetAmount, setTargetAmount] = useState<number>(3500);
  const [summary, setSummary] = useState('');
  const [fullDescription, setFullDescription] = useState('');

  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; targetPercent: number; proofType: string }>>([
    { title: 'Reagents & Experimental Setup', description: 'Procure reagents and calibrate sensor apparatus.', targetPercent: 40, proofType: 'Lab Assay Data' },
    { title: 'Validation Trials & Raw Open Dataset', description: 'Run 50 trials and publish raw dataset to IPFS.', targetPercent: 60, proofType: 'IPFS Dataset' }
  ]);

  const [openAccessCommitment, setOpenAccessCommitment] = useState(
    'All raw datasets will be published to IPFS under CC-BY 4.0 with open preprints on arXiv / bioRxiv.'
  );

  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPercent = milestones.reduce((sum, m) => sum + m.targetPercent, 0);

  const addMilestone = () => {
    if (milestones.length >= 4) return;
    setMilestones([...milestones, { 
      title: 'Phase Milestone', 
      description: 'Deliverable proof details...', 
      targetPercent: 20,
      proofType: 'IPFS Dataset'
    }]);
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

  // Step 1 Validation
  const handleNextStep1 = () => {
    if (!university || !researcherName) {
      setError('Please provide your university and lead researcher name.');
      return;
    }
    setError(null);
    setWizardStep(2);
  };

  // Step 2 Validation
  const handleNextStep2 = () => {
    if (!title || !summary || targetAmount <= 0) {
      setError('Please complete the title, summary, and funding target.');
      return;
    }
    setError(null);
    setWizardStep(3);
  };

  // Step 3 Validation
  const handleNextStep3 = () => {
    if (totalPercent !== 100) {
      setError(`Milestone allocations must total exactly 100% (currently ${totalPercent}%).`);
      return;
    }
    setError(null);
    setWizardStep(4);
  };

  // Final Deployment Execution
  const handleDeployContract = async () => {
    setIsDeploying(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 1500));

      const calculatedMilestones: Milestone[] = milestones.map((m, idx) => ({
        id: `m-custom-${Date.now()}-${idx}`,
        index: idx + 1,
        title: m.title,
        description: m.description,
        targetPercent: m.targetPercent,
        targetAmount: Math.round((m.targetPercent / 100) * targetAmount),
        status: idx === 0 ? 'in_progress' : 'pending',
        proofType: m.proofType as any
      }));

      const mockEscrow = 'GC' + Array.from({ length: 54 }, () => 
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
    } catch (err: any) {
      setError(err.message || 'Deployment failed.');
    } finally {
      setIsDeploying(false);
    }
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

        {/* Wizard Header & Stepper */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Researcher Portal • Step {wizardStep} of 4</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {wizardStep === 1 && 'Academic Identity & Lab Affiliation'}
            {wizardStep === 2 && 'Research Proposal & Budget'}
            {wizardStep === 3 && 'Milestone Escrow Schedule'}
            {wizardStep === 4 && 'Review & Smart Escrow Deployment'}
          </h3>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  wizardStep === step 
                    ? 'w-10 bg-cyan-600' 
                    : wizardStep > step 
                    ? 'w-6 bg-emerald-500' 
                    : 'w-6 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {wizardStep === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-slate-700 flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-cyan-700 shrink-0" />
              <span>Verify your university department and academic credentials to build donor trust.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">University / Institution *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University / Oxford"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Lab / Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Center for Bio-Sensors"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Researcher Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alex Mercer"
                  value={researcherName}
                  onChange={(e) => setResearcherName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. PhD Candidate / Postdoc"
                  value={researcherRole}
                  onChange={(e) => setResearcherRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Institutional Email (.edu / .ac.uk)</label>
              <input
                type="email"
                placeholder="e.g. researcher@oxford.ac.uk"
                value={eduEmail}
                onChange={(e) => setEduEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep1}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue to Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROPOSAL & TARGET */}
        {wizardStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Open Fluorometric Assay for Cellular Senescence"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Field Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                >
                  <option value="Public Health">Public Health</option>
                  <option value="Agritech & Food">Agritech & Food</option>
                  <option value="Clean Energy">Clean Energy</option>
                  <option value="AI & Compute">AI & Compute</option>
                  <option value="Longevity & Bio">Longevity & Bio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Total Funding Target (USDC) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-16 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-cyan-600"
                  min="100"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">USDC</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Short Abstract (for campaign card) *</label>
              <textarea
                required
                rows={2}
                placeholder="What scientific problem does this project solve?"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Experimental Plan & Budget Breakdown</label>
              <textarea
                rows={3}
                placeholder="Detailed methodology, equipment costs, and deliverables..."
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue to Milestones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MILESTONES & PROOF COMMITMENTS */}
        {wizardStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-slate-900">Milestone Tranche Allocations</span>
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

            <div className="space-y-2.5">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
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
                      placeholder="Expected Deliverable Proof (e.g. IPFS dataset, GitHub repo)"
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

            <div className="pt-2">
              <label className="text-xs font-semibold text-teal-800 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Open Science Commitment
              </label>
              <input
                type="text"
                required
                value={openAccessCommitment}
                onChange={(e) => setOpenAccessCommitment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep3}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Review & Deploy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SMART CONTRACT ESCROW DEPLOYMENT */}
        {wizardStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Proposal</span>
                <span className="font-bold text-slate-900">{title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Researcher & Uni</span>
                <span className="text-slate-800 font-medium">{researcherName} • {university}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Funding Target</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">${targetAmount.toLocaleString()} USDC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Escrow Milestones</span>
                <span className="font-medium text-slate-800">{milestones.length} Conditional Tranches</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-cyan-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan-700" />
                Stellar Soroban Escrow Guarantee:
              </div>
              <p className="text-[11px] text-slate-600">
                Deploying this proposal compiles a unique smart escrow instance on Stellar Testnet. Funds contributed by donors will remain locked until milestone proofs are published and verified.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                disabled={isDeploying}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDeployContract}
                disabled={isDeploying}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition flex items-center gap-2"
              >
                {isDeploying ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Deploying Soroban Escrow Instance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Deploy Escrow & Publish Proposal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
