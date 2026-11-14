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

  // Check if re-seeding to Nigerian campaigns is needed
  const stanfordCheck = db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE university LIKE '%Stanford%'").get() as { count: number };
  const totalCount = db.prepare("SELECT COUNT(*) as count FROM campaigns").get() as { count: number };

  if (stanfordCheck.count > 0 || totalCount.count < 8) {
    console.log('Migrating database to Nigerian university DeSci campaigns...');
    db.exec('DELETE FROM donations; DELETE FROM milestones; DELETE FROM campaigns;');
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('Seeding Nigerian university DeSci campaigns into SQLite database...');

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
    // 1. University of Ibadan (UI)
    insertCampaign.run({
      id: 'campaign-1',
      title: 'Decentralized Micro-Genomics for Rapid Antimalarial Drug Resistance Mapping',
      category: 'Public Health',
      university: 'University of Ibadan (UI)',
      labName: 'Institute for Advanced Medical Research & Training (IAMRAT)',
      researcherName: 'Dr. Babatunde Adeyemi',
      researcherRole: 'Senior Lecturer & Genomic Epidemiologist',
      researcherAvatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Field sequencing Plasmodium falciparum kelch13 gene mutations in rural Oyo State primary health centres using portable MinION sequencers to track emerging artemisinin tolerance.',
      fullDescription: "Artemisinin-based combination therapies (ACTs) are Nigeria's frontline defense against malaria. Recent reports show emerging kelch13 gene mutations that cause partial drug resistance. Traditional surveillance takes 14 months through central bureaucracy. Our lab brings low-cost Oxford Nanopore MinION sequencers directly to 12 rural clinics in Ibarapa. We need $3,800 USDC for reagents, barcoding flow cells, and an IPFS dataset pipeline to publish live resistance maps for public health officers.",
      targetAmount: 3800,
      raisedAmount: 2850,
      donorCount: 54,
      stellarEscrowAddress: 'GC7YUI27...IAMRAT99 (Stellar Soroban Escrow)',
      openAccessCommitment: 'All raw FASTA genomic reads and variant frequencies published on IPFS and NCBI GenBank under CC-BY 4.0.',
      tags: JSON.stringify(['Malaria Genomics', 'Drug Resistance', 'Public Health', 'Open Science']),
      bannerGradient: 'from-emerald-900/60 via-teal-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm1-1',
      campaignId: 'campaign-1',
      mIndex: 1,
      title: 'Field Sample Collection & Barcoding across 12 Clinics',
      description: 'Collect 300 clinical dry blood spot (DBS) samples across Ibarapa district primary healthcare clinics.',
      targetPercent: 30,
      targetAmount: 1140,
      status: 'completed',
      proofUrl: 'https://ipfs.io/ipfs/bafybeic5y...malaria_samples.pdf',
      proofType: 'IPFS Dataset',
      txHash: '0x3f7a8b...stellar99a',
      releasedAt: '3 days ago'
    });

    insertMilestone.run({
      id: 'm1-2',
      campaignId: 'campaign-1',
      mIndex: 2,
      title: 'MinION Nanopore Deep Sequencing of Kelch13 & Pfmdr1 Genes',
      description: 'Perform targeted amplicon sequencing on portable flow cells to quantify single nucleotide polymorphisms.',
      targetPercent: 40,
      targetAmount: 1520,
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
      title: 'Open Genomic Variant Dashboard & Epidemiological Policy Brief',
      description: 'Deploy public web dashboard on IPFS and deliver molecular surveillance dossier to Oyo State Ministry of Health.',
      targetPercent: 30,
      targetAmount: 1140,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // 2. Obafemi Awolowo University (OAU)
    insertCampaign.run({
      id: 'campaign-2',
      title: 'Peer-to-Peer Solar Mini-Grid Smart Metering with Stellar Micro-Settlements',
      category: 'Clean Energy',
      university: 'Obafemi Awolowo University (OAU)',
      labName: 'OAU Center for Energy Research and Development (CERD)',
      researcherName: 'Engr. Folashade Adeleke & Team',
      researcherRole: 'Lead Power Systems Researcher & PhD Fellow',
      researcherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Prototyping tamper-proof IoT energy meters with automated Stellar micropayment channels for campus hostels and agrarian off-grid micro-grids.',
      fullDescription: 'Grid instability forces Nigerian university campuses and rural off-grid cooperatives to rely on expensive diesel generators (over $0.60/kWh). We have prototyped an open-source ESP32 smart power meter that measures real-time solar inverter load and triggers sub-cent USDC settlements on Stellar Horizon. We need $2,900 USDC to fabricate 40 custom PCB metering units and deploy an experimental 15kW solar microgrid pilot in Ife community.',
      targetAmount: 2900,
      raisedAmount: 2900,
      donorCount: 67,
      stellarEscrowAddress: 'GDOAU61...CERD77 (Stellar Soroban Escrow)',
      openAccessCommitment: 'Hardware schematics, KiCAD PCB files, and ESP32 firmware released under CERN-OHL-P open hardware license.',
      tags: JSON.stringify(['Clean Energy', 'Solar Mini-Grid', 'IoT Hardware', 'DePIN']),
      bannerGradient: 'from-amber-900/60 via-orange-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm2-1',
      campaignId: 'campaign-2',
      mIndex: 1,
      title: 'Custom PCB Metering Hardware & Firmware Staking',
      description: 'Fabricate 40 production prototype boards with ADE7753 energy measurement ICs and LoRa transceivers.',
      targetPercent: 35,
      targetAmount: 1015,
      status: 'completed',
      proofUrl: 'https://github.com/oau-cerd/stellar-solar-meter',
      proofType: 'GitHub Repository',
      txHash: '0x992b41...stellar33e',
      releasedAt: '1 week ago'
    });

    insertMilestone.run({
      id: 'm2-2',
      campaignId: 'campaign-2',
      mIndex: 2,
      title: 'Stellar Soroban Smart Contract for Automatic Meter Settlement',
      description: 'Deploy Soroban contract that parses signed telemetry payloads and triggers direct per-kWh transfers.',
      targetPercent: 35,
      targetAmount: 1015,
      status: 'completed',
      proofUrl: 'https://zenodo.org/record/oau-cerd-settlement.pdf',
      proofType: 'Preprint Paper',
      txHash: '0xfa881c...stellar01d',
      releasedAt: 'Yesterday'
    });

    insertMilestone.run({
      id: 'm2-3',
      campaignId: 'campaign-2',
      mIndex: 3,
      title: 'Live 40-Unit Hostel Deployment & Energy Yield Ledger',
      description: 'Complete 30-day live deployment across Moremi and Fajuyi hostels with open-access energy production telemetry.',
      targetPercent: 30,
      targetAmount: 870,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // 3. University of Lagos (UNILAG)
    insertCampaign.run({
      id: 'campaign-3',
      title: 'Low-Cost Paper-Based Lateral Flow Assay for Sickle Cell Genotype Screening',
      category: 'Longevity & Bio',
      university: 'University of Lagos (UNILAG)',
      labName: 'UNILAG College of Medicine / LUTH Hematology Group',
      researcherName: 'Dr. Chidinma Okafor',
      researcherRole: 'Associate Professor of Clinical Biochemistry',
      researcherAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Developing a $0.40 saliva-and-capillary-blood paper diagnostic strip to detect HbS and HbC variants within 10 minutes without laboratory electricity.',
      fullDescription: 'Nigeria has the highest burden of sickle cell disorder globally, with over 150,000 infants born with SCD annually. Hemoglobin electrophoresis costs $15-$25 and requires specialized lab equipment not found in rural primary health centers. Our lab engineered a gold-nanoparticle visual lateral flow strip that differentiates HbA, HbS, and HbC in 10 minutes for less than $0.40. We need $4,200 USDC to synthesize 1,000 validation strips and run blind clinical controls at LUTH.',
      targetAmount: 4200,
      raisedAmount: 3150,
      donorCount: 61,
      stellarEscrowAddress: 'GCUNILAG88...LUTH55 (Stellar Soroban Escrow)',
      openAccessCommitment: 'Diagnostic strip conjugation protocols and clinical sensitivity data open-published on Zenodo and protocols.io.',
      tags: JSON.stringify(['Sickle Cell', 'Point-of-Care Diagnostics', 'Biochemistry', 'Open Health']),
      bannerGradient: 'from-rose-900/60 via-red-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm3-1',
      campaignId: 'campaign-3',
      mIndex: 1,
      title: 'Monoclonal Antibody Conjugation & Gold Nanoparticle Synthesis',
      description: 'Synthesize 20nm colloidal gold nanoparticles conjugated to anti-HbS monoclonal antibodies with >98% specificity.',
      targetPercent: 30,
      targetAmount: 1260,
      status: 'completed',
      proofUrl: 'https://zenodo.org/record/8492041',
      proofType: 'Lab Assay Data',
      txHash: '0x12ac49...stellar87f',
      releasedAt: '4 days ago'
    });

    insertMilestone.run({
      id: 'm3-2',
      campaignId: 'campaign-3',
      mIndex: 2,
      title: 'Blinded 250-Patient Clinical Validation at LUTH',
      description: 'Run blind diagnostic accuracy tests against HPLC gold standards on 250 pediatric blood samples at LUTH.',
      targetPercent: 40,
      targetAmount: 1680,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    insertMilestone.run({
      id: 'm3-3',
      campaignId: 'campaign-3',
      mIndex: 3,
      title: 'Open Strip Manufacturing Blueprints & WHO Prequalification Dossier',
      description: 'Release complete nitrocellulose membrane assembly specifications and deposit validation dossiers.',
      targetPercent: 30,
      targetAmount: 1260,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // 4. Federal University of Agriculture, Abeokuta (FUNAAB)
    insertCampaign.run({
      id: 'campaign-4',
      title: 'Computer-Vision Early Detection of Cassava Mosaic Disease on Edge Mobile',
      category: 'Agritech & Food',
      university: 'Federal University of Agriculture, Abeokuta (FUNAAB)',
      labName: 'FUNAAB Precision Crop Health & AI Agronomy Lab',
      researcherName: 'Prof. Olumide Balogun',
      researcherRole: 'Chair of Agricultural Informatics',
      researcherAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Training lightweight MobileNet-v4 computer vision models on 45,000 drone and smartphone leaf images to detect asymptomatic CMD infections offline.',
      fullDescription: 'Cassava is the dietary staple for over 100 million Nigerians, but Cassava Mosaic Disease (CMD) and Brown Streak Virus destroy up to 40% of smallholder yields before visible leaf chlorosis appears. Our team collected 45,000 multi-spectral images from Ogun and Oyo farms. We need $2,400 USDC for edge compute TPU benchmarking, offline Android app packaging in Yoruba, Hausa, and Igbo, and open-source data release on Zenodo.',
      targetAmount: 2400,
      raisedAmount: 1680,
      donorCount: 38,
      stellarEscrowAddress: 'GCFUNAAB94...CROP22 (Stellar Soroban Escrow)',
      openAccessCommitment: 'All annotated leaf datasets and PyTorch ONNX model weights open-sourced under CC-BY 4.0.',
      tags: JSON.stringify(['Agritech', 'Edge AI', 'Cassava Yield', 'Food Security']),
      bannerGradient: 'from-lime-900/60 via-emerald-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm4-1',
      campaignId: 'campaign-4',
      mIndex: 1,
      title: 'Multi-Spectral Field Dataset Labeling & Augmentation',
      description: 'Annotate and cross-validate 45,000 RGB and NIR cassava foliar images across 14 Nigerian cultivars.',
      targetPercent: 40,
      targetAmount: 960,
      status: 'completed',
      proofUrl: 'https://zenodo.org/record/cmd-funaab-2026',
      proofType: 'IPFS Dataset',
      txHash: '0x88f4bc...stellar21b',
      releasedAt: '5 days ago'
    });

    insertMilestone.run({
      id: 'm4-2',
      campaignId: 'campaign-4',
      mIndex: 2,
      title: 'Quantized Mobile Vision Pipeline & Multi-Language Voice Guidance',
      description: 'INT8 quantization of MobileNet-v4 achieving <45ms latency on low-end MediaTek devices with local audio alerts.',
      targetPercent: 35,
      targetAmount: 840,
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
      title: 'Field Pilot with 300 Smallholder Cassava Farmers in Ogun State',
      description: 'Distribute offline APK to 300 cooperative farmers in Owode and Abeokuta and verify yield protection rates.',
      targetPercent: 25,
      targetAmount: 600,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // 5. University of Nigeria, Nsukka (UNN)
    insertCampaign.run({
      id: 'campaign-5',
      title: 'Multi-Sensor Satellite & Hydrological AI for Niger & Benue River Flood Forecasting',
      category: 'AI & Compute',
      university: 'University of Nigeria, Nsukka (UNN)',
      labName: 'UNN Space Science & Applied Geoinformatics Research Group',
      researcherName: 'Dr. Nkemdilim Chukwu',
      researcherRole: 'Senior Research Fellow in Hydrological Modelling',
      researcherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Integrating Sentinel-1 SAR radar imagery with river gauge telemetry to provide 72-hour hyper-local flood alerts for vulnerable agrarian communities.',
      fullDescription: 'Catastrophic seasonal flooding along the Niger and Benue basins displaces millions of Nigerians and ruins billions in agricultural harvest annually due to lack of localized early warning systems. We have developed a physics-informed neural network (PINN) that combines Sentinel-1 Synthetic Aperture Radar with solar-powered ultrasonic river water-level sensors. We need $3,600 USDC to fabricate 15 rugged ultrasonic river nodes, pay cloud compute costs, and provide open SMS/Telegram warning webhooks.',
      targetAmount: 3600,
      raisedAmount: 2520,
      donorCount: 49,
      stellarEscrowAddress: 'GCUNN44...FLOOD88 (Stellar Soroban Escrow)',
      openAccessCommitment: 'Real-time hydrological river telemetry and inundation prediction models published live via open public API.',
      tags: JSON.stringify(['Flood Prediction', 'Satellite Radar', 'Disaster Resilience', 'Open GeoData']),
      bannerGradient: 'from-blue-900/60 via-cyan-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm5-1',
      campaignId: 'campaign-5',
      mIndex: 1,
      title: 'Ultrasonic River Telemetry Node Prototyping with Solar Enclosures',
      description: 'Design IP67 weather-sealed ultrasonic stage gauges with GSM-LTE data uplink modules.',
      targetPercent: 30,
      targetAmount: 1080,
      status: 'completed',
      proofUrl: 'https://github.com/unn-geoinfo/niger-benue-flood-nodes',
      proofType: 'GitHub Repository',
      txHash: '0xaa4411...stellar66c',
      releasedAt: '1 week ago'
    });

    insertMilestone.run({
      id: 'm5-2',
      campaignId: 'campaign-5',
      mIndex: 2,
      title: 'Sentinel-1 SAR Physics-Informed Flood Inundation Model Calibration',
      description: 'Train PINN on 10 years of historical Niger Basin hydrological flow rates and SAR backscatter indices.',
      targetPercent: 40,
      targetAmount: 1440,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    insertMilestone.run({
      id: 'm5-3',
      campaignId: 'campaign-5',
      mIndex: 3,
      title: 'Public Real-Time Flood Alert Dashboard & API Dispatch',
      description: 'Launch open public flood dashboard and test emergency SMS broadcasting to 1,000 riverside households in Lokoja and Onitsha.',
      targetPercent: 30,
      targetAmount: 1080,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // 6. Ahmadu Bello University (ABU), Zaria
    insertCampaign.run({
      id: 'campaign-6',
      title: 'Moringa Oleifera Seed Nanofiltration Membrane for Clean Rural Borehole Water',
      category: 'Clean Energy',
      university: 'Ahmadu Bello University (ABU), Zaria',
      labName: 'ABU Department of Chemical Engineering & Environmental Materials',
      researcherName: 'Dr. Aminu Garba',
      researcherRole: 'Associate Professor of Nanotechnology',
      researcherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Synthesizing eco-friendly coagulant nanofiltration membranes derived from native northern Moringa oleifera seeds to eliminate heavy metals and coliform bacteria.',
      fullDescription: 'Over 60 million Nigerians lack access to safe drinking water, suffering from high turbidity, microbial contamination, and lead traces in shallow boreholes. Chemical coagulants like aluminum sulfate are costly and generate toxic sludge. Our team discovered a green chemical process that functionalizes cationic proteins extracted from indigenous Moringa oleifera seeds onto bio-cellulose filters. We need $2,100 USDC to purchase laboratory filtration test columns and perform microbial kill-rate validations.',
      targetAmount: 2100,
      raisedAmount: 1470,
      donorCount: 33,
      stellarEscrowAddress: 'GCABU19...WATER11 (Stellar Soroban Escrow)',
      openAccessCommitment: 'Membrane fabrication recipes and coliform clearance spectrometry results freely published on Zenodo.',
      tags: JSON.stringify(['Clean Water', 'Nanofiltration', 'Green Chemistry', 'Moringa BioTech']),
      bannerGradient: 'from-teal-900/60 via-emerald-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm6-1',
      campaignId: 'campaign-6',
      mIndex: 1,
      title: 'Moringa Seed Protein Extraction & Functionalization onto Bio-Cellulose',
      description: 'Extract dimeric cationic proteins from Moringa seeds and cross-link onto electrospun bacterial cellulose scaffolds.',
      targetPercent: 50,
      targetAmount: 1050,
      status: 'completed',
      proofUrl: 'https://zenodo.org/record/abu-moringa-water-2026',
      proofType: 'Lab Assay Data',
      txHash: '0xbb2938...stellar14a',
      releasedAt: '6 days ago'
    });

    insertMilestone.run({
      id: 'm6-2',
      campaignId: 'campaign-6',
      mIndex: 2,
      title: 'Standardized E. coli & Coliform Reduction Endurance Trials',
      description: 'Continuous 1,000-liter flow challenge demonstrating >99.9% coliform reduction and turbidity under 1.0 NTU.',
      targetPercent: 30,
      targetAmount: 630,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    insertMilestone.run({
      id: 'm6-3',
      campaignId: 'campaign-6',
      mIndex: 3,
      title: 'Open Source Rural Gravity Filter Blueprint & Community Water Manual',
      description: 'Publish complete zero-electricity gravity filtration bucket designs in English and Hausa for rural communities.',
      targetPercent: 20,
      targetAmount: 420,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // 7. Covenant University, Ota
    insertCampaign.run({
      id: 'campaign-7',
      title: 'Decentralized Low-Bandwidth Fraud Detection for African Mobile Money Agents',
      category: 'AI & Compute',
      university: 'Covenant University',
      labName: 'Covenant Applied Informatics & Cyber-Physical Systems Lab',
      researcherName: 'Dr. Tochukwu Eze & Segun Makinde',
      researcherRole: 'FinTech & Cybersecurity Research Fellows',
      researcherAvatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Deploying graph neural network (GNN) anomaly detectors optimized for low-bandwidth 2G POS terminals used by Nigerian financial inclusion POS agents.',
      fullDescription: "Over 1.5 million POS agent operators power Nigeria's cash-in cash-out banking network. However, card-swapping and synthetic identity fraud cost informal merchants over $18M annually. We are building a federated Graph Neural Network (GNN) model that analyzes transaction topologies locally on POS hardware without exposing user PII. We need $3,200 USDC to benchmark model latency across 5 popular Android POS architectures and open-source our synthetic African FinTech benchmark dataset.",
      targetAmount: 3200,
      raisedAmount: 2240,
      donorCount: 44,
      stellarEscrowAddress: 'GCCOV83...FINTECH44 (Stellar Soroban Escrow)',
      openAccessCommitment: 'Federated learning scripts, POS ONNX runtimes, and synthetic financial transaction graph benchmarks open on GitHub.',
      tags: JSON.stringify(['FinTech Security', 'Graph Neural Networks', 'Edge AI', 'Financial Inclusion']),
      bannerGradient: 'from-purple-900/60 via-indigo-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm7-1',
      campaignId: 'campaign-7',
      mIndex: 1,
      title: 'Synthetic Transaction Graph Benchmark Generation & Anonymization',
      description: 'Construct 500,000 synthetic transaction sub-graphs mimicking real-world Nigerian POS agent velocity patterns.',
      targetPercent: 35,
      targetAmount: 1120,
      status: 'completed',
      proofUrl: 'https://github.com/covenant-cyber/pos-fraud-gnn',
      proofType: 'GitHub Repository',
      txHash: '0xee9102...stellar52d',
      releasedAt: '4 days ago'
    });

    insertMilestone.run({
      id: 'm7-2',
      campaignId: 'campaign-7',
      mIndex: 2,
      title: 'Federated GNN Edge Inference Engine for Android POS',
      description: 'Quantize relational graph attention network to run under 80MB RAM on Android 8.1 POS devices with sub-120ms latency.',
      targetPercent: 35,
      targetAmount: 1120,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    insertMilestone.run({
      id: 'm7-3',
      campaignId: 'campaign-7',
      mIndex: 3,
      title: 'Live 50-Agent Pilot in Ota Commercial Markets & Security Audit',
      description: 'Deploy pilot build to 50 agent kiosks in Ogun and Lagos State, logging edge fraud interception rate.',
      targetPercent: 30,
      targetAmount: 960,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // 8. Federal University of Technology, Akure (FUTA)
    insertCampaign.run({
      id: 'campaign-8',
      title: 'Upcycled Spent EV LiFePO4 Batteries for Rural Primary Health Clinic Cold-Chains',
      category: 'Clean Energy',
      university: 'Federal University of Technology, Akure (FUTA)',
      labName: 'FUTA Renewable Energy & Battery Systems Innovation Hub',
      researcherName: 'Engr. Kelechi Nnamdi',
      researcherRole: 'Senior Lecturer in Energy Storage Systems',
      researcherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      researcherVerified: 1,
      summary: 'Re-engineering discarded electric motorcycle and tricycle (keke) LiFePO4 battery modules into 5kWh backup storage units with smart BMS monitoring for vaccine refrigeration.',
      fullDescription: 'Routine childhood vaccines spoil when rural primary healthcare facilities lose grid electricity. At the same time, growing commercial e-mobility in Nigerian cities is creating an influx of retired 48V battery packs that still retain 75-80% capacity. Our hub has designed an open-source, modular Battery Management System (BMS) with CAN-bus telemetry and remote cell balancing that repurposes these second-life packs. We need $2,600 USDC to build two 5kWh pilot storage banks with Stellar IoT health attestations for a rural Ondo clinic.',
      targetAmount: 2600,
      raisedAmount: 1820,
      donorCount: 36,
      stellarEscrowAddress: 'GCFUTA72...BATTERY33 (Stellar Soroban Escrow)',
      openAccessCommitment: 'BMS schematics, firmware code, and battery degradation profiles released freely under open licenses.',
      tags: JSON.stringify(['Battery Upcycling', 'Clean Energy', 'Healthcare Resilience', 'Circular Economy']),
      bannerGradient: 'from-cyan-900/60 via-blue-900/40 to-slate-900',
      createdAt: new Date().toISOString()
    });

    insertMilestone.run({
      id: 'm8-1',
      campaignId: 'campaign-8',
      mIndex: 1,
      title: 'Retired LiFePO4 Cell Capacity Degradation & Impedance Sorting',
      description: 'Characterize 120 retired prismatic cells using electrochemical impedance spectroscopy to identify viable second-life modules.',
      targetPercent: 35,
      targetAmount: 910,
      status: 'completed',
      proofUrl: 'https://ipfs.io/ipfs/bafybeic5y...battery_tests.pdf',
      proofType: 'Lab Assay Data',
      txHash: '0xcc8832...stellar41b',
      releasedAt: '2 days ago'
    });

    insertMilestone.run({
      id: 'm8-2',
      campaignId: 'campaign-8',
      mIndex: 2,
      title: 'Custom Modular BMS Fabrication with Active Balancing',
      description: 'Fabricate 16S active balancing board with STM32 controller and isolated RS485 communication link.',
      targetPercent: 35,
      targetAmount: 910,
      status: 'in_progress',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    insertMilestone.run({
      id: 'm8-3',
      campaignId: 'campaign-8',
      mIndex: 3,
      title: 'Solar-Coupled Vaccine Cold Chain Deployment & Proof Test',
      description: 'Install 5kWh upcycled bank at Oba-Ile Primary Health Centre powering a 12V vaccine chest freezer for 72h zero-grid autonomy.',
      targetPercent: 30,
      targetAmount: 780,
      status: 'pending',
      proofUrl: null,
      proofType: null,
      txHash: null,
      releasedAt: null
    });

    // Seed initial ledger transactions (authentic Nigerian names & donors)
    insertDonation.run({
      id: 'tx-seed-1',
      campaignId: 'campaign-1',
      donorName: 'Adeola Johnson (Lagos Angel)',
      donorAddress: 'GD5K4ZJ...89X2QW',
      amount: 150,
      txHash: 'stellar_0x8f2a99182cdb3149eef3',
      timestamp: '5 mins ago'
    });

    insertDonation.run({
      id: 'tx-seed-2',
      campaignId: 'campaign-2',
      donorName: 'Ife CleanTech Syndicate',
      donorAddress: 'GC3T4Y...92J8KL',
      amount: 250,
      txHash: 'stellar_0x33e8a1005b42a421bca9',
      timestamp: '18 mins ago'
    });

    insertDonation.run({
      id: 'tx-seed-3',
      campaignId: 'campaign-4',
      donorName: 'Agritech Philanthropy Node',
      donorAddress: 'GBLP99...55RQ22',
      amount: 75,
      txHash: 'stellar_0x9918afbc5523da91842c',
      timestamp: '1 hour ago'
    });
  });

  transaction();
  console.log('Nigerian DeSci database seeded successfully with 8 research campaigns.');
}
