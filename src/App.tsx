import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_CAMPAIGNS } from './data/mockCampaigns';
import { Campaign, Category } from './types';
import { 
  fetchCampaigns, 
  createCampaignApi, 
  donateToCampaignApi, 
  verifyMilestoneApi, 
  fetchDonationsApi 
} from './api/client';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CampaignCard } from './components/CampaignCard';
import { CampaignDetailModal } from './components/CampaignDetailModal';
import { DonateModal } from './components/DonateModal';
import { CreateCampaignModal } from './components/CreateCampaignModal';
import { DeSciComparison } from './components/DeSciComparison';
import { StellarLedgerDrawer } from './components/StellarLedgerDrawer';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<Campaign | null>(null);
  const [donatingCampaign, setDonatingCampaign] = useState<Campaign | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Recent ledger donations
  const [recentDonations, setRecentDonations] = useState<Array<{
    id: string;
    campaignTitle: string;
    amount: number;
    donorAddress: string;
    txHash: string;
    timestamp: string;
  }>>([]);

  // Load live data from SQLite backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [loadedCampaigns, loadedDonations] = await Promise.all([
          fetchCampaigns(),
          fetchDonationsApi()
        ]);

        if (loadedCampaigns && loadedCampaigns.length > 0) {
          setCampaigns(loadedCampaigns);
        }
        if (loadedDonations && loadedDonations.length > 0) {
          setRecentDonations(loadedDonations);
        }
      } catch (err) {
        console.warn('Backend connection failed, using local fallback state:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Aggregate stats
  const totalRaised = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  }, [campaigns]);

  const totalDonors = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + c.donorCount, 0);
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        c.title.toLowerCase().includes(q) || 
        c.university.toLowerCase().includes(q) ||
        c.researcherName.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [campaigns, selectedCategory, searchQuery]);

  // Handle successful donation (persisted to SQLite)
  const handleDonationSuccess = async (amount: number, txHash: string) => {
    if (!donatingCampaign) return;

    try {
      const { updatedCampaign, donation } = await donateToCampaignApi(donatingCampaign.id, {
        amount,
        donorAddress: 'GC3T4Y...MY_WALLET',
        donorName: 'Pollar Donor',
        txHash
      });

      setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
      setRecentDonations(prev => [
        {
          id: donation.id,
          campaignTitle: donatingCampaign.title,
          amount,
          donorAddress: donation.donorAddress,
          txHash,
          timestamp: 'Just now'
        },
        ...prev
      ]);
    } catch (err) {
      // Fallback local update if backend fails
      setCampaigns(prev => prev.map(c => {
        if (c.id === donatingCampaign.id) {
          return {
            ...c,
            raisedAmount: c.raisedAmount + amount,
            donorCount: c.donorCount + 1
          };
        }
        return c;
      }));
    }
  };

  // Handle milestone unlock verification (persisted to SQLite)
  const handleUpdateMilestoneStatus = async (campaignId: string, milestoneId: string) => {
    try {
      const updatedCampaign = await verifyMilestoneApi(campaignId, milestoneId);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c));
      setSelectedCampaignDetail(updatedCampaign);
    } catch (err) {
      console.error('Failed to verify milestone on backend:', err);
    }
  };

  // Handle new campaign proposal (persisted to SQLite)
  const handleCreateCampaign = async (newCampaign: Campaign) => {
    try {
      const created = await createCampaignApi(newCampaign);
      setCampaigns(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create campaign on backend, adding locally:', err);
      setCampaigns(prev => [newCampaign, ...prev]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-slate-900 selection:bg-cyan-200 selection:text-slate-900">
      
      {/* Top Navigation */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Hero & Search Header */}
        <Hero
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalRaised={totalRaised}
          totalDonors={totalDonors}
          onOpenCreate={() => setIsCreateOpen(true)}
        />

        {/* Campaign Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                {selectedCategory === 'All' ? 'All Research Labs' : selectedCategory}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredCampaigns.length} verified academic initiatives
              </p>
            </div>
            {isLoading && (
              <span className="text-xs text-cyan-700 font-mono animate-pulse">
                Syncing with SQLite & Stellar...
              </span>
            )}
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">No campaigns found matching your search.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-slate-100 text-xs text-cyan-700 font-semibold hover:bg-slate-200 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onSelectCampaign={(c) => setSelectedCampaignDetail(c)}
                  onQuickDonate={(c) => setDonatingCampaign(c)}
                />
              ))}
            </div>
          )}
        </section>

        {/* DeSci Educational Section */}
        <DeSciComparison />

      </main>

      {/* Footer */}
      <Footer />

      {/* Campaign Detail Modal */}
      {selectedCampaignDetail && (
        <CampaignDetailModal
          campaign={selectedCampaignDetail}
          onClose={() => setSelectedCampaignDetail(null)}
          onDonate={(c) => setDonatingCampaign(c)}
          onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
        />
      )}

      {/* Donate Modal */}
      {donatingCampaign && (
        <DonateModal
          campaign={donatingCampaign}
          onClose={() => setDonatingCampaign(null)}
          onSuccess={handleDonationSuccess}
        />
      )}

      {/* Create Proposal Modal */}
      {isCreateOpen && (
        <CreateCampaignModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateCampaign}
        />
      )}

      {/* About / DeSci Modal */}
      {isAboutOpen && (
        <DeSciComparison
          isModal={true}
          onClose={() => setIsAboutOpen(false)}
        />
      )}

      {/* Stellar Ledger Activity Drawer */}
      {isLedgerOpen && (
        <StellarLedgerDrawer
          onClose={() => setIsLedgerOpen(false)}
          recentDonations={recentDonations}
        />
      )}

    </div>
  );
};
