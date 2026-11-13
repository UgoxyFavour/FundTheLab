import { Campaign } from '../types';

const API_BASE = '/api';

export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching campaigns from backend:', err);
    throw err;
  }
}

export async function createCampaignApi(campaignData: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaignData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create campaign');
  }
  const json = await res.json();
  return json.data;
}

export async function donateToCampaignApi(
  campaignId: string, 
  data: { amount: number; donorAddress: string; donorName?: string; txHash?: string }
): Promise<{ updatedCampaign: Campaign; donation: any }> {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/donate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to record donation');
  }
  const json = await res.json();
  return { updatedCampaign: json.data, donation: json.donation };
}

export async function verifyMilestoneApi(
  campaignId: string,
  milestoneId: string,
  data?: { proofUrl?: string; proofType?: string }
): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/milestones/${milestoneId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to verify milestone');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchDonationsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/donations`);
    if (!res.ok) throw new Error('Failed to fetch donations');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching donations ledger:', err);
    return [];
  }
}

export async function checkStellarHealthApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/stellar/health`);
    if (!res.ok) return { connected: false };
    const json = await res.json();
    return json.data;
  } catch {
    return { connected: false };
  }
}
