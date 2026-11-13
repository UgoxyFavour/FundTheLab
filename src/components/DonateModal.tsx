import React, { useState } from 'react';
import { Campaign } from '../types';
import { usePollarWallet } from '../context/PollarContext';
import { 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Wallet
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
  const { wallet, sendDonation, connectWithGoogle } = usePollarWallet();
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txSuccess, setTxSuccess] = useState<{ txHash: string; amount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleDonate = async () => {
    if (finalAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }
    if (!wallet.isConnected) {
      setErrorMessage('Please connect your Pollar wallet first.');
      return;
    }
    if (wallet.balanceUSDC < finalAmount) {
      setErrorMessage(`Insufficient balance. You have $${wallet.balanceUSDC.toFixed(2)} USDC.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await sendDonation({
        recipientEscrow: campaign.stellarEscrowAddress,
        amountUSDC: finalAmount,
        campaignTitle: campaign.title,
        memo: `FundTheLab-${campaign.id}`
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTxSuccess({
        txHash: result.txHash,
        amount: finalAmount
      });

      onSuccess(finalAmount, result.txHash);
    } catch (err: any) {
      setErrorMessage(err.message || 'Transaction failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyHash = () => {
    if (txSuccess?.txHash) {
      navigator.clipboard.writeText(txSuccess.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-base font-mono"
        >
          ✕
        </button>

        {/* SUCCESS VIEW */}
        {txSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Micro-Grant Confirmed!</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              You sent <strong className="text-emerald-600 font-mono">${txSuccess.amount} USDC</strong> directly into the research milestone escrow on Stellar.
            </p>

            <div className="my-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Stellar Transaction Hash</span>
                <button 
                  onClick={handleCopyHash}
                  className="text-cyan-700 hover:text-cyan-600 flex items-center gap-1 text-[11px] font-medium"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-xs text-cyan-800 break-all select-all font-medium">
                {txSuccess.txHash}
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5 border-t border-slate-200 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Settled in 2.8s • 0 XLM gas sponsored by Pollar</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-cyan-600/20 hover:opacity-95 transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          /* DONATION FORM */
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-teal-700">
              <Heart className="w-4 h-4 fill-teal-100 text-teal-600" />
              <span>Direct-to-Lab Micro-Grant</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-1">
              {campaign.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              100% of your grant funds milestone deliverables with zero administrative cuts.
            </p>

            {/* Wallet Status indicator */}
            {!wallet.isConnected ? (
              <div className="my-4 p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-cyan-900 font-medium">
                  <Wallet className="w-4 h-4 text-cyan-700" />
                  <span>Connect your Pollar wallet to proceed.</span>
                </div>
                <button
                  onClick={connectWithGoogle}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Pollar Wallet Balance:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ${wallet.balanceUSDC.toFixed(2)} USDC
                </span>
              </div>
            )}

            {/* Amount Selection */}
            <div className="space-y-3 mt-4">
              <label className="text-xs font-semibold text-slate-700">
                Select Amount (USDC):
              </label>

              {/* Preset buttons */}
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
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                  }}
                  className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-cyan-600 transition shadow-xs"
                  min="1"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 font-mono">
                  USDC
                </span>
              </div>
            </div>

            {/* Fee Transparency Box */}
            <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Grant Amount</span>
                <span className="font-mono font-bold text-slate-900">${finalAmount.toFixed(2)} USDC</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Gas Fee (Stellar Network)
                </span>
                <span className="text-teal-700 font-semibold">$0.00 (Sponsored by Pollar)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                <span>University Overhead Deducted</span>
                <span className="text-emerald-600 font-semibold">0% (Bypassed)</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDonate}
                disabled={isSubmitting || finalAmount <= 0}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Signing via Pollar...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Confirm ${finalAmount} USDC Grant</span>
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
