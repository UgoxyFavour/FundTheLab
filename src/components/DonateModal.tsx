import React, { useState } from 'react';
import { Campaign } from '../types';
import { usePollarWallet, TransactionStep } from '../context/PollarContext';
import { 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Wallet,
  ExternalLink,
  Lock,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: (amount: number, txHash: string) => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

export const DonateModal: React.FC<DonateModalProps> = ({
  campaign,
  onClose,
  onSuccess
}) => {
  const { wallet, executeStellarPayment } = usePollarWallet();

  // Multi-step modal state
  // 1: amount, 2: review, 3: signing/stepper, 4: confirmed
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorMemo, setDonorMemo] = useState<string>('');
  const [userConfirmedCheck, setUserConfirmedCheck] = useState<boolean>(false);
  const [signingProgress, setSigningProgress] = useState<TransactionStep>({
    step: 'building',
    label: 'Preparing Soroban Escrow envelope...'
  });
  const [txReceipt, setTxReceipt] = useState<{ txHash: string; ledger: number; amount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleProceedToReview = () => {
    if (finalAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }
    if (!wallet.isConnected) {
      setErrorMessage('Please connect your Pollar wallet first.');
      return;
    }
    if (wallet.balanceUSDC < finalAmount) {
      setErrorMessage(`Insufficient balance: You have $${wallet.balanceUSDC.toFixed(2)} USDC.`);
      return;
    }
    setErrorMessage(null);
    setModalStep(2);
  };

  const handleExecuteSigning = async () => {
    setModalStep(3);
    setErrorMessage(null);

    try {
      const result = await executeStellarPayment({
        recipientEscrow: campaign.stellarEscrowAddress,
        amountUSDC: finalAmount,
        campaignTitle: campaign.title,
        memo: donorMemo || `FundTheLab-${campaign.id}`,
        onProgress: (step) => setSigningProgress(step)
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTxReceipt({
        txHash: result.txHash,
        ledger: result.ledger,
        amount: finalAmount
      });

      setModalStep(4);
      onSuccess(finalAmount, result.txHash);
    } catch (err: any) {
      setErrorMessage(err.message || 'Transaction signing failed. Please try again.');
      setModalStep(2);
    }
  };

  const handleCopyHash = () => {
    if (txReceipt?.txHash) {
      navigator.clipboard.writeText(txReceipt.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        {modalStep !== 3 && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-base font-mono"
          >
            ✕
          </button>
        )}

        {/* STEP 1: SET AMOUNT & MEMO */}
        {modalStep === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-teal-700">
              <Heart className="w-4 h-4 fill-teal-100 text-teal-600" />
              <span>Step 1 of 3: Select Micro-Grant Amount</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-1">
              {campaign.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              100% of your grant funds milestone deliverables with zero administrative cuts.
            </p>

            {/* Wallet Balance badge */}
            <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Your Wallet Balance:</span>
              <span className="font-mono font-bold text-emerald-600">
                ${wallet.balanceUSDC.toFixed(2)} USDC
              </span>
            </div>

            {/* Preset Amount Grid */}
            <div className="space-y-3 mt-4">
              <label className="text-xs font-semibold text-slate-700">
                Select Amount (USDC):
              </label>

              <div className="grid grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 rounded-xl font-mono text-xs font-bold transition ${
                        isSelected
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  placeholder="Custom USDC Amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-cyan-600 transition shadow-xs"
                  min="1"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 font-mono">
                  USDC
                </span>
              </div>

              {/* Optional Memo */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Optional Donor Memo (Recorded on Stellar Ledger)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In honor of open bio-research"
                  value={donorMemo}
                  onChange={(e) => setDonorMemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Next Action */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToReview}
                disabled={finalAmount <= 0}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Review Transaction Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TRANSACTION REVIEW & POLLAR GASLESS QUOTE */}
        {modalStep === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
              <button 
                onClick={() => setModalStep(1)}
                className="hover:text-slate-900 font-semibold"
              >
                ← Back
              </button>
              <span>•</span>
              <span className="font-semibold text-teal-700">Step 2 of 3: Authorization & Review</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Authorize Grant to Escrow</h3>
            <p className="text-xs text-slate-500 mt-1">
              Review transaction details before cryptographically signing via Pollar.
            </p>

            {/* Detailed Transaction Sheet */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Grant Total</span>
                <span className="font-mono font-extrabold text-base text-slate-900">
                  ${finalAmount.toFixed(2)} USDC
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">From (Your Address)</span>
                <span className="font-mono text-slate-800 font-medium">
                  {wallet.address?.slice(0, 10)}...{wallet.address?.slice(-6)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">To (Soroban Escrow)</span>
                <span className="font-mono text-cyan-800 font-medium">
                  {campaign.stellarEscrowAddress.slice(0, 12)}...
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Network & Protocol</span>
                <span className="text-slate-800 font-medium">Stellar Testnet / Soroban</span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1 text-teal-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Pollar Paymaster Fee
                </span>
                <span className="text-teal-700 font-bold">Sponsored (0.00 XLM / $0.00)</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">University Overhead</span>
                <span className="text-emerald-600 font-bold">0% Bypassed</span>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200 cursor-pointer">
              <input
                type="checkbox"
                checked={userConfirmedCheck}
                onChange={(e) => setUserConfirmedCheck(e.target.checked)}
                className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-xs text-slate-700">
                I understand this micro-grant is locked into the campaign's Stellar escrow and will be disbursed upon verified research milestones.
              </span>
            </label>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteSigning}
                disabled={!userConfirmedCheck}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign & Broadcast Transaction</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE STELLAR CONSENSUS SIGNING STEPPER */}
        {modalStep === 3 && (
          <div className="py-6 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-200 border-t-cyan-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-600" />
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                Processing On-Chain Transaction
              </h4>
              <p className="text-xs text-cyan-700 font-mono mt-1 font-semibold">
                {signingProgress.label}
              </p>
            </div>

            {/* Progress Stepper indicators */}
            <div className="space-y-2 text-left max-w-sm mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Compiled Soroban Contract Envelope</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Pollar Paymaster Fee Sponsorship Granted</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Broadcasting to Stellar Testnet Consensus...</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFIED ON-CHAIN RECEIPT */}
        {modalStep === 4 && txReceipt && (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Micro-Grant Verified on Stellar!</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Your grant of <strong className="text-emerald-600 font-mono">${txReceipt.amount} USDC</strong> has been deposited into the milestone smart escrow.
            </p>

            {/* Live On-Chain Receipt */}
            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Stellar Transaction Hash</span>
                <button 
                  onClick={handleCopyHash}
                  className="text-cyan-700 hover:text-cyan-600 flex items-center gap-1 text-[11px] font-medium"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-900 break-all select-all font-medium bg-white p-2 rounded-lg border border-slate-200">
                {txReceipt.txHash}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500">Stellar Ledger:</span>{' '}
                  <span className="font-mono font-bold text-slate-800">#{txReceipt.ledger}</span>
                </div>
                <div>
                  <span className="text-slate-500">Network Fee:</span>{' '}
                  <span className="font-bold text-teal-700">0 XLM (Sponsored)</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txReceipt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-700 hover:text-cyan-800 font-medium underline"
                >
                  <span>Verify on Stellar Expert Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-cyan-600/20 hover:opacity-95 transition"
            >
              Done & Return to Labs
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
