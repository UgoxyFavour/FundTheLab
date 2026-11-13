import React from 'react';
import { ExternalLink, ShieldCheck, ArrowDownLeft } from 'lucide-react';

interface StellarLedgerDrawerProps {
  onClose: () => void;
  recentDonations: Array<{
    id: string;
    campaignTitle: string;
    amount: number;
    donorAddress: string;
    txHash: string;
    timestamp: string;
  }>;
}

export const StellarLedgerDrawer: React.FC<StellarLedgerDrawerProps> = ({
  onClose,
  recentDonations
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-base font-mono"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-700 font-bold">Stellar Soroban Ledger</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Live On-Chain Escrow Activity</h3>
        <p className="text-xs text-slate-500 mt-1">
          Real-time record of micro-grants and milestone unlocks settled on Stellar Testnet.
        </p>

        {/* List of Transactions */}
        <div className="mt-5 space-y-3 overflow-y-auto pr-1 flex-1">
          {recentDonations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent transactions recorded yet. Make a donation to generate on-chain activity!
            </div>
          ) : (
            recentDonations.map((tx) => (
              <div 
                key={tx.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate line-clamp-1">
                      {tx.campaignTitle}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>Donor: {tx.donorAddress.slice(0, 6)}...{tx.donorAddress.slice(-4)}</span>
                      <span>•</span>
                      <span>{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-emerald-600 text-sm">
                    +${tx.amount} USDC
                  </div>
                  <div className="font-mono text-[10px] text-cyan-700 flex items-center gap-1 justify-end mt-0.5" title={tx.txHash}>
                    <span>{tx.txHash.slice(0, 10)}...</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-teal-700 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gas fees sponsored by Pollar</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
