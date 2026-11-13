import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fundthelab.db');
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Campaigns Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      university TEXT NOT NULL,
      labName TEXT NOT NULL,
      researcherName TEXT NOT NULL,
      researcherRole TEXT NOT NULL,
      researcherAvatar TEXT NOT NULL,
      researcherVerified INTEGER DEFAULT 1,
      summary TEXT NOT NULL,
      fullDescription TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      raisedAmount REAL DEFAULT 0,
      donorCount INTEGER DEFAULT 0,
      stellarEscrowAddress TEXT NOT NULL,
      openAccessCommitment TEXT NOT NULL,
      tags TEXT NOT NULL,
      bannerGradient TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // 2. Milestones Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      campaignId TEXT NOT NULL,
      mIndex INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      targetPercent REAL NOT NULL,
      targetAmount REAL NOT NULL,
      status TEXT NOT NULL,
      proofUrl TEXT,
      proofType TEXT,
      txHash TEXT,
      releasedAt TEXT,
      FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE
    )
  `);

  // 3. Donations / Stellar Escrow Ledger Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      campaignId TEXT NOT NULL,
      donorName TEXT NOT NULL,
      donorAddress TEXT NOT NULL,
      amount REAL NOT NULL,
      txHash TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE
    )
  `);

  // Check if initial seeding is needed
  const count = db.prepare('SELECT COUNT(*) as count FROM campaigns').get() as { count: number };
  if (count.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('Seeding initial DeSci campaigns into SQLite database...');

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (
      id, title, category, university, labName, researcherName, researcherRole,
      researcherAvatar, researcherVerified, summary, fullDescription, targetAmount,
      raisedAmount, donorCount, stellarEscrowAddress, openAccessCommitment, tags,
      bannerGradient, createdAt
    ) VALUES (
      @id, @title, @category, @university, @labName, @researcherName, @researcherRole,
      @researcherAvatar, @researcherVerified, @summary, @fullDescription, @targetAmount,
      @raisedAmount, @donorCount, @stellarEscrowAddress, @openAccessCommitment, @tags,
      @bannerGradient, @createdAt
    )
  `);

  const insertMilestone = db.prepare(`
    INSERT INTO milestones (
      id, campaignId, mIndex, title, description, targetPercent, targetAmount,
      status, proofUrl, proofType, txHash, releasedAt
    ) VALUES (
      @id, @campaignId, @mIndex, @title, @description, @targetPercent, @targetAmount,
      @status, @proofUrl, @proofType, @txHash, @releasedAt
    )
  `);

  const insertDonation = db.prepare(`
    INSERT INTO donations (id, campaignId, donorName, donorAddress, amount, txHash, timestamp)
    VALUES (@id, @campaignId, @donorName, @donorAddress, @amount, @txHash, @timestamp)
  `);

  const transaction = db.transaction(() => {
    // Campaign 1: Stanford BioLab
    insertCampaign.run({
      id: 'campaign-1',
      title: 'Open Cellular Senescence Biomarker Assay in Human Fibroblasts',
      category: 'Longevity & Bio',
      university: 'Stanford University',
      labName: 'Stanford Center for Rejuvenation Biology',
      researcherName: 'Dr. Elena Rostova',
      researcherRole: 'Postdoctoral Fellow in Molecular Biology',
      researcherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Developing a low-cost, open-source fluorometric assay to track senescent cell accumulation in aged tissue samples without commercial proprietary reagent kits.',
      fullDescription: 'Senescence biomarkers currently require proprietary fluorescent probes costing over $800 per run. Our lab has engineered an open-access recombinant fluorescent reporter protein synthesized in E. coli. We need $3,500 to run 50 cell culture assay validations, publish our protocol openly, and deposit the plasmid vector to Addgene for global researchers.',
      targetAmount: 3500,
      raisedAmount: 2450,
      donorCount: 42,
      stellarEscrowAddress: 'GD5K4ZJ...89X2QW (Stellar Soroban Escrow)',
      openAccessCommitment: 'All protocols published under CC-BY 4.0. Plasmid deposited to Addgene; raw mass spectrometry data released on IPFS.',
      tags: JSON.stringify(['Cellular Senescence', 'Open Science', 'Longevity', 'Bio-assay']),
      bannerGradient: 'from-emerald-900/60 via-teal-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm1-1',
      campaignId: 'campaign-1',
      mIndex: 1,
      title: 'Recombinant Expression Vector Synthesis & Purification',
      description: 'Synthesize bacterial expression constructs and purify recombinant reporter proteins with >95% purity.',
      targetPercent: 30,
      targetAmount: 1050,
      status: 'completed',
      proofUrl: 'https://ipfs.io/ipfs/bafybeic5y...report_chromatography.pdf',
      proofType: 'IPFS Dataset',
      txHash: '0x3f7a8b...stellar99a',
      releasedAt: '2 days ago'
    });

    insertMilestone.run({
      id: 'm1-2',
      campaignId: 'campaign-1',
      mIndex: 2,
      title: 'Cell Culture Dose-Response Validation (50 Trials)',
      description: 'Validate assay sensitivity against doxorubicin-induced senescent human fibroblast cultures.',
      targetPercent: 40,
      targetAmount: 1400,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    insertMilestone.run({
      id: 'm1-3',
      campaignId: 'campaign-1',
      mIndex: 3,
      title: 'Open Protocol Publication & Public Data Release',
      description: 'Publish complete step-by-step wet-lab protocol on Protocols.io and open-source raw imaging datasets.',
      targetPercent: 30,
      targetAmount: 1050,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // Campaign 2: MIT CSAIL
    insertCampaign.run({
      id: 'campaign-2',
      title: 'Verifiable On-Chain Interpretability Probes for Open LLMs',
      category: 'AI & Compute',
      university: 'MIT',
      labName: 'MIT CSAIL Alignment & Mechanistic Group',
      researcherName: 'Marcus Vance & Team',
      researcherRole: 'PhD Candidate in Machine Learning',
      researcherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Renting H100 GPU compute clusters to train sparse autoencoders on Llama-3 8B representations, detecting deceptive latent behaviors.',
      fullDescription: 'Mechanistic interpretability requires sparse autoencoders (SAEs) that require thousands of GPU hours. Traditional academic compute grants take 6 months to approve. With $4,800, we can immediately secure 800 H100 hours via decentralized compute clusters to extract interpretable dictionary features and open-source all weights on HuggingFace.',
      targetAmount: 4800,
      raisedAmount: 4800,
      donorCount: 78,
      stellarEscrowAddress: 'GC3T4Y...92J8KL (Stellar Soroban Escrow)',
      openAccessCommitment: 'All model checkpoints and SAE dictionary weights released to HuggingFace under Apache 2.0 license.',
      tags: JSON.stringify(['AI Safety', 'Mechanistic Interpretability', 'Open Weights', 'GPU Compute']),
      bannerGradient: 'from-blue-900/60 via-indigo-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm2-1',
      campaignId: 'campaign-2',
      mIndex: 1,
      title: 'Compute Allocation & Baseline Feature Extraction',
      description: 'Cluster setup and extraction of 32k hidden state vectors across layers 12-24.',
      targetPercent: 40,
      targetAmount: 1920,
      status: 'completed',
      proofUrl: 'https://github.com/mit-csail/llama3-sae-probes',
      proofType: 'GitHub Repository',
      txHash: '0x992b41...stellar33e',
      releasedAt: '1 week ago'
    });

    insertMilestone.run({
      id: 'm2-2',
      campaignId: 'campaign-2',
      mIndex: 2,
      title: 'Sparse Autoencoder Training & Latent Dictionary Discovery',
      description: 'Train 65k-feature SAEs on L1 sparsity penalty and evaluate reconstruction loss.',
      targetPercent: 40,
      targetAmount: 1920,
      status: 'completed',
      proofUrl: 'https://huggingface.co/models/open-sae-llama3',
      proofType: 'Preprint Paper',
      txHash: '0xfa881c...stellar01d',
      releasedAt: 'Yesterday'
    });

    insertMilestone.run({
      id: 'm2-3',
      campaignId: 'campaign-2',
      mIndex: 3,
      title: 'Deception Detection Benchmarks & Public Demo Interface',
      description: 'Release interactive browser visualizer for SAE steering vectors.',
      targetPercent: 20,
      targetAmount: 960,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // Campaign 3: Imperial College London
    insertCampaign.run({
      id: 'campaign-3',
      title: 'Biodegradable Zinc-Air Micro-Batteries for Remote IoT Sensors',
      category: 'Clean Energy',
      university: 'Imperial College London',
      labName: 'Sustainable Materials & Energy Storage Lab',
      researcherName: 'Dr. Tarek Al-Mansoor',
      researcherRole: 'Senior Research Associate',
      researcherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Prototyping non-toxic, compostable paper-based zinc-air battery cells capable of powering agricultural IoT sensor nodes for 90 days.',
      fullDescription: 'Lithium batteries in soil sensors create hazardous electronic waste. We have engineered a cellulose-gel electrolyte paired with zinc dust electrodes that safely compost into soil micronutrients. We need $2,200 for high-purity cellulose aerogel synthesis and cyclic voltammetry endurance testing.',
      targetAmount: 2200,
      raisedAmount: 1350,
      donorCount: 29,
      stellarEscrowAddress: 'GBLP99...55RQ22 (Stellar Soroban Escrow)',
      openAccessCommitment: 'Hardware CAD schematics, bill-of-materials, and cell cycling data published open-source.',
      tags: JSON.stringify(['Clean Energy', 'Biodegradable Battery', 'DePIN', 'Open Hardware']),
      bannerGradient: 'from-amber-900/60 via-orange-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm3-1',
      campaignId: 'campaign-3',
      mIndex: 1,
      title: 'Cellulose Aerogel Electrolyte Fabrication',
      description: 'Synthesize freeze-dried bacterial nanocellulose matrix with 92% ionic conductivity.',
      targetPercent: 50,
      targetAmount: 1100,
      status: 'completed',
      proofUrl: 'https://zenodo.org/record/8492041',
      proofType: 'Lab Assay Data',
      txHash: '0x12ac49...stellar87f',
      releasedAt: '3 days ago'
    });

    insertMilestone.run({
      id: 'm3-2',
      campaignId: 'campaign-3',
      mIndex: 2,
      title: 'Continuous Discharge & Soil Degradation Validation',
      description: 'Test 20 battery prototypes under continuous 5mA load and monitor 60-day composting rate in soil.',
      targetPercent: 50,
      targetAmount: 1100,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // Campaign 4: Oxford
    insertCampaign.run({
      id: 'campaign-4',
      title: 'High-Density EEG Dataset for Motor Imagery in ALS Patients',
      category: 'Neuroscience',
      university: 'Oxford University',
      labName: 'Oxford NeuroTech & BCI Laboratory',
      researcherName: 'Sarah Jenkins, MSc',
      researcherRole: 'Doctoral Researcher',
      researcherAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Collecting, preprocessing, and releasing an open 128-channel motor imagery EEG dataset from 20 motor-impaired volunteers.',
      fullDescription: 'Existing open brain-computer interface (BCI) datasets are tiny and biased toward healthy college students. Our team is recording clinical-grade 128-electrode EEG data during assistive communication tasks. Micro-funding of $2,900 covers volunteer honorariums, conductive gel supplies, and anonymized BIDS-formatted dataset hosting.',
      targetAmount: 2900,
      raisedAmount: 950,
      donorCount: 19,
      stellarEscrowAddress: 'GDOO83...11ZX64 (Stellar Soroban Escrow)',
      openAccessCommitment: 'Fully anonymized BIDS-compliant dataset shared via PhysioNet and IPFS under Open Data Commons license.',
      tags: JSON.stringify(['BCI', 'Neuroscience', 'Open Data', 'ALS Assistive Tech']),
      bannerGradient: 'from-purple-900/60 via-pink-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm4-1',
      campaignId: 'campaign-4',
      mIndex: 1,
      title: 'Ethics Board Protocol & Recording Hardware Calibration',
      description: 'Complete Oxford IRB approval and test signal impedance across 128 channels.',
      targetPercent: 35,
      targetAmount: 1015,
      status: 'completed',
      proofUrl: 'https://ipfs.io/ipfs/bafybeih...irb_approval_cert.pdf',
      proofType: 'IPFS Dataset',
      txHash: '0xaa782e...stellar52b',
      releasedAt: '2 weeks ago'
    });

    insertMilestone.run({
      id: 'm4-2',
      campaignId: 'campaign-4',
      mIndex: 2,
      title: 'Patient Recording Sessions (10 of 20 Volunteers)',
      description: 'Conduct first cohort of motor-imagery trials with synchronized eye-tracking.',
      targetPercent: 35,
      targetAmount: 1015,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    insertMilestone.run({
      id: 'm4-3',
      campaignId: 'campaign-4',
      mIndex: 3,
      title: 'Full Dataset Anonymization & Open BIDS Release',
      description: 'Clean artifacts, run blind quality checks, and publish full dataset.',
      targetPercent: 30,
      targetAmount: 870,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // Seed initial ledger transactions
    insertDonation.run({
      id: 'tx-seed-1',
      campaignId: 'campaign-1',
      donorName: 'Anonymous Alumni',
      donorAddress: 'GD5K4ZJ...89X2QW',
      amount: 50,
      txHash: 'stellar_0x8f2a99182cdb3149eef3',
      timestamp: '5 mins ago'
    });

    insertDonation.run({
      id: 'tx-seed-2',
      campaignId: 'campaign-2',
      donorName: 'AI Safety Advocate',
      donorAddress: 'GC3T4Y...92J8KL',
      amount: 100,
      txHash: 'stellar_0x33e8a1005b42a421bca9',
      timestamp: '18 mins ago'
    });

    insertDonation.run({
      id: 'tx-seed-3',
      campaignId: 'campaign-3',
      donorName: 'CleanTech Angel',
      donorAddress: 'GBLP99...55RQ22',
      amount: 25,
      txHash: 'stellar_0x9918afbc5523da91842c',
      timestamp: '1 hour ago'
    });
  });

  transaction();
  console.log('Database seeded successfully.');
}
