import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDatabase } from './db.js';
import { getStellarAccountInfo, checkStellarNetworkHealth } from './stellarService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
initDatabase();

// --- HELPER: FORMAT CAMPAIGN FROM DB ---
function getFullCampaign(campaignRow: any) {
  const milestones = db.prepare(`
    SELECT 
      id, mIndex as [index], title, description, targetPercent, targetAmount,
      status, proofUrl, proofType, txHash, releasedAt
    FROM milestones 
    WHERE campaignId = ? 
    ORDER BY mIndex ASC
  `).all(campaignRow.id);

  return {
    ...campaignRow,
    researcherVerified: Boolean(campaignRow.researcherVerified),
    tags: JSON.parse(campaignRow.tags || '[]'),
    milestones
  };
}

// --- 1. GET ALL CAMPAIGNS ---
app.get('/api/campaigns', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM campaigns ORDER BY createdAt DESC').all();
    const campaigns = rows.map(getFullCampaign);
    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 2. GET SINGLE CAMPAIGN ---
app.get('/api/campaigns/:id', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({ success: true, data: getFullCampaign(row) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 3. CREATE NEW CAMPAIGN ---
app.post('/api/campaigns', (req: Request, res: Response) => {
  try {
    const {
      title, category, university, labName, researcherName, researcherRole,
      researcherAvatar, summary, fullDescription, targetAmount,
      stellarEscrowAddress, openAccessCommitment, tags, bannerGradient, milestones
    } = req.body;

    if (!title || !university || !researcherName || !summary || !targetAmount) {
      return res.status(400).json({ success: false, error: 'Missing required campaign fields' });
    }

    const campaignId = `campaign-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const insertCampaign = db.prepare(`
      INSERT INTO campaigns (
        id, title, category, university, labName, researcherName, researcherRole,
        researcherAvatar, researcherVerified, summary, fullDescription, targetAmount,
        raisedAmount, donorCount, stellarEscrowAddress, openAccessCommitment, tags,
        bannerGradient, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMilestone = db.prepare(`
      INSERT INTO milestones (
        id, campaignId, mIndex, title, description, targetPercent, targetAmount,
        status, proofUrl, proofType, txHash, releasedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const createTransaction = db.transaction(() => {
      insertCampaign.run(
        campaignId,
        title,
        category || 'Longevity & Bio',
        university,
        labName || `${university} Research Unit`,
        researcherName,
        researcherRole || 'Lead Researcher',
        researcherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        1,
        summary,
        fullDescription || summary,
        targetAmount,
        0, // raisedAmount
        0, // donorCount
        stellarEscrowAddress || `GC${Array.from({ length: 54 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('')} (Soroban Escrow)`,
        openAccessCommitment || 'Open data published to IPFS under CC-BY 4.0.',
        JSON.stringify(tags || ['DeSci', 'Open Science']),
        bannerGradient || 'from-cyan-900/60 via-teal-900/40 to-slate-900',
        createdAt
      );

      if (Array.isArray(milestones)) {
        milestones.forEach((m: any, idx: number) => {
          insertMilestone.run(
            m.id || `m-${campaignId}-${idx + 1}`,
            campaignId,
            idx + 1,
            m.title,
            m.description || '',
            m.targetPercent,
            m.targetAmount || Math.round((m.targetPercent / 100) * targetAmount),
            idx === 0 ? 'in_progress' : 'pending',
            null,
            null,
            null,
            null
          );
        });
      }
    });

    createTransaction();

    const createdRow = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    res.status(201).json({ success: true, data: getFullCampaign(createdRow) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 4. RECORD DONATION (STELLAR ESCROW DEPOSIT) ---
app.post('/api/campaigns/:id/donate', (req: Request, res: Response) => {
  try {
    const campaignId = req.params.id;
    const { amount, donorAddress, donorName, txHash } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid donation amount is required' });
    }

    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const generatedTxHash = txHash || `stellar_${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const donationId = `tx-${Date.now()}`;
    const timestamp = 'Just now';

    const updateTx = db.transaction(() => {
      // 1. Update campaign raisedAmount and donorCount
      db.prepare(`
        UPDATE campaigns 
        SET raisedAmount = raisedAmount + ?, donorCount = donorCount + 1
        WHERE id = ?
      `).run(amount, campaignId);

      // 2. Insert into donations ledger
      db.prepare(`
        INSERT INTO donations (id, campaignId, donorName, donorAddress, amount, txHash, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        donationId,
        campaignId,
        donorName || 'Pollar Supporter',
        donorAddress || 'GC3T4Y...ANON',
        amount,
        generatedTxHash,
        timestamp
      );
    });

    updateTx();

    const updatedRow = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    res.json({
      success: true,
      data: getFullCampaign(updatedRow),
      donation: {
        id: donationId,
        campaignId,
        amount,
        donorAddress: donorAddress || 'GC3T4Y...ANON',
        txHash: generatedTxHash,
        timestamp
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 5. VERIFY MILESTONE & RELEASE TRANCHE ---
app.post('/api/campaigns/:id/milestones/:mId/verify', (req: Request, res: Response) => {
  try {
    const { id: campaignId, mId: milestoneId } = req.params;
    const { proofUrl, proofType } = req.body;

    const milestone = db.prepare('SELECT * FROM milestones WHERE id = ? AND campaignId = ?').get(milestoneId, campaignId) as any;
    if (!milestone) {
      return res.status(404).json({ success: false, error: 'Milestone not found' });
    }

    const verifyTx = db.transaction(() => {
      // 1. Mark current milestone as completed
      db.prepare(`
        UPDATE milestones 
        SET status = 'completed', 
            releasedAt = 'Just now',
            proofUrl = ?,
            proofType = ?,
            txHash = ?
        WHERE id = ?
      `).run(
        proofUrl || 'https://ipfs.io/ipfs/bafybeih...verified_dataset.tar.gz',
        proofType || 'IPFS Dataset',
        `stellar_escrow_release_${Date.now().toString(16)}`,
        milestoneId
      );

      // 2. Set next pending milestone to in_progress
      const allMilestones = db.prepare('SELECT id, mIndex, status FROM milestones WHERE campaignId = ? ORDER BY mIndex ASC').all(campaignId) as any[];
      const currentIndex = allMilestones.findIndex(m => m.id === milestoneId);
      if (currentIndex !== -1 && currentIndex + 1 < allMilestones.length) {
        const nextMilestone = allMilestones[currentIndex + 1];
        if (nextMilestone.status === 'pending') {
          db.prepare("UPDATE milestones SET status = 'in_progress' WHERE id = ?").run(nextMilestone.id);
        }
      }
    });

    verifyTx();

    const updatedRow = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    res.json({ success: true, data: getFullCampaign(updatedRow) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 6. GET DONATIONS LEDGER ---
app.get('/api/donations', (req: Request, res: Response) => {
  try {
    const donations = db.prepare(`
      SELECT 
        d.id, d.campaignId, d.donorName, d.donorAddress, d.amount, d.txHash, d.timestamp,
        c.title as campaignTitle
      FROM donations d
      LEFT JOIN campaigns c ON d.campaignId = c.id
      ORDER BY d.id DESC
      LIMIT 50
    `).all();

    res.json({ success: true, data: donations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- 7. LIVE STELLAR TESTNET HORIZON INTEGRATION ---
app.get('/api/stellar/health', async (req: Request, res: Response) => {
  const health = await checkStellarNetworkHealth();
  res.json({ success: true, data: health });
});

app.get('/api/stellar/account/:address', async (req: Request, res: Response) => {
  const result = await getStellarAccountInfo(req.params.address);
  res.json(result);
});

// --- 8. GENERAL API HEALTHCHECK ---
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'SQLite (WAL Mode Enabled)',
    stellarNetwork: 'Stellar Testnet / Soroban'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FundTheLab Backend & SQLite running at http://localhost:${PORT}`);
});
