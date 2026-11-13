export type Category = 
  | 'All'
  | 'Longevity & Bio'
  | 'AI & Compute'
  | 'Clean Energy'
  | 'Neuroscience'
  | 'Quantum & Physics';

export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';

export interface Milestone {
  id: string;
  index: number;
  title: string;
  description: string;
  targetPercent: number; // e.g. 30 for 30%
  targetAmount: number;  // in USDC
  status: MilestoneStatus;
  proofUrl?: string;
  proofType?: 'IPFS Dataset' | 'GitHub Repository' | 'Preprint Paper' | 'Lab Assay Data';
  txHash?: string;
  releasedAt?: string;
}

export interface Campaign {
  id: string;
  title: string;
  category: Exclude<Category, 'All'>;
  university: string;
  labName: string;
  researcherName: string;
  researcherRole: string;
  researcherAvatar: string;
  researcherVerified: boolean;
  summary: string;
  fullDescription: string;
  targetAmount: number; // in USDC
  raisedAmount: number; // in USDC
  donorCount: number;
  stellarEscrowAddress: string;
  openAccessCommitment: string;
  milestones: Milestone[];
  tags: string[];
  bannerGradient: string;
}

export interface DonationRecord {
  id: string;
  campaignId: string;
  donorName: string;
  donorAddress: string;
  amount: number;
  txHash: string;
  timestamp: string;
}
