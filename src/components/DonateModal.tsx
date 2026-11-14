import React, { useState } from 'react';
import { Campaign } from '../types';
import { usePollarWallet, TransactionStep } from '../context/PollarContext';
import { 
  Heart, 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  ArrowRight,
  AlertCircle,
  Copy,
  CreditCard,
  Building2,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: (amount: number, txHash: string) => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];
const NGN_RATE = 1550; // 1 USDC = ₦1,550 NGN

export const DonateModal: React.FC<DonateModalProps> = ({
  campaign,
  onClose,
  onSuccess
}) => {
  const { wallet, executeStellarPayment } = usePollarWallet();

  // Multi-step modal state
  // 1: amount & rail, 2: review, 3: signing/stepper, 4: confirmed
  const [modalStep, setModalStep] = useState<1 | 2 | 3 | 4>(1);
  const [paymentRail, setPaymentRail] = useState<'usdc' | 'ngn_card' | 'ngn_transfer'>('usdc');
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorMemo, setDonorMemo] = useState<string>('');
  const [userConfirmedCheck, setUserConfirmedCheck] = useState<boolean>(false);
  
  // Simulated card fields for NGN Card rail
  const [cardNumber, setCardNumber] = useState('5399 •••• •••• 9104');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  
  const [signingProgress, setSigningProgress] = useState<TransactionStep>({
    step: 'building',
    label: 'Preparing Soroban Escrow envelope...'
  });
  const [txReceipt, setTxReceipt] = useState<{ 
    txHash: string; 
    ledger: number; 
    amount: number;
    paymentRail: 'usdc' | 'ngn_card' | 'ngn_transfer';
    ngnEquivalent?: number;
    fiatRef?: string;
  } | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const finalAmountNGN = finalAmount * NGN_RATE;

  const handleProceedToReview = () => {
    if (finalAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }
    if (paymentRail === 'usdc') {
      if (!wallet.isConnected) {
        setErrorMessage('Please connect your Pollar wallet first or select NGN Card / Bank Transfer.');
        return;
      }
      if (wallet.balanceUSDC < finalAmount) {
        setErrorMessage(`Insufficient balance: You have $${wallet.balanceUSDC.toFixed(2)} USDC.`);
        return;
      }
    }
    setErrorMessage(null);
    setModalStep(2);
  };

  const handleExecuteSigning = async () => {
    setModalStep(3);
    setErrorMessage(null);

    try {
      if (paymentRail === 'usdc') {
        // Standard Pollar on-chain flow
        const result = await executeStellarPayment({
          recipientEscrow: campaign.stellarEscrowAddress,
          amountUSDC: finalAmount,
          campaignTitle: campaign.title,
          memo: donorMemo,
          onProgress: (prog) => setSigningProgress(prog)
        });

        setTxReceipt({
          txHash: result.txHash,
          ledger: result.ledger,
          amount: finalAmount,
          paymentRail: 'usdc'
        });

        onSuccess(finalAmount, result.txHash);
      } else {
        // NGN Card / Bank Transfer Fiat-to-Stellar On-Ramp flow
        setSigningProgress({
          step: 'building',
          label: paymentRail === 'ngn_card' 
            ? 'Authorizing 3D-Secure NGN Card Payment (Paystack / Cowrie)...'
            : 'Verifying Virtual NUBAN Bank Transfer...'
        });
        await new Promise(r => setTimeout(r, 900));

        setSigningProgress({
          step: 'sponsoring',
          label: `Minting $${finalAmount.toFixed(2)} USDC via Stellar Anchor (Cowrie / Pollar Rail)...`
        });
        await new Promise(r => setTimeout(r, 900));

        setSigningProgress({
          step: 'signing',
          label: 'Requesting Pollar Paymaster gas sponsorship (0 XLM fee)...'
        });
        await new Promise(r => setTimeout(r, 800));

        setSigningProgress({
          step: 'broadcasting',
          label: 'Locking USDC into Soroban Smart Escrow contract...'
        });
        await new Promise(r => setTimeout(r, 1000));

        const genTxHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const genLedger = 54922000 + Math.floor(Math.random() * 3000);
        const fiatRef = `PSTK-NGN-${Date.now().toString().slice(-8)}`;

        setTxReceipt({
          txHash: genTxHash,
          ledger: genLedger,
          amount: finalAmount,
          paymentRail,
          ngnEquivalent: finalAmountNGN,
          fiatRef
        });

        onSuccess(finalAmount, genTxHash);
      }

      setModalStep(4);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment execution failed');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Fund This Research</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{campaign.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: AMOUNT & PAYMENT RAIL SELECTION */}
        {modalStep === 1 && (
          <div className="mt-4 space-y-4 overflow-y-auto">
            
            {/* Payment Rail Toggle */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Select Payment Rail
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setPaymentRail('usdc')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    paymentRail === 'usdc'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-cyan-600" />
                  <span>USDC (Pollar)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentRail('ngn_card')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    paymentRail === 'ngn_card' || paymentRail === 'ngn_transfer'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>₦ NGN Card / Bank</span>
                </button>
              </div>
            </div>

            {/* If NGN Rail, show sub-tabs for Card vs Virtual NUBAN */}
            {(paymentRail === 'ngn_card' || paymentRail === 'ngn_transfer') && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-950">Paystack / Cowrie Fiat Rail</span>
                  <span className="font-mono text-emerald-700 font-bold">1 USDC = ₦{NGN_RATE.toLocaleString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentRail('ngn_card')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition ${
                      paymentRail === 'ngn_card'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Debit Card (Verve/Visa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentRail('ngn_transfer')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition ${
                      paymentRail === 'ngn_transfer'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Direct Bank Transfer
                  </button>
                </div>

                {paymentRail === 'ngn_transfer' && (
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-slate-700 space-y-1">
                    <div className="text-slate-500 font-medium">Virtual Dedicated NUBAN:</div>
                    <div className="font-mono font-bold text-slate-900">Wema Bank • 9821038472</div>
                    <div className="text-emerald-700">Account Name: FundTheLab Escrow Pool</div>
                  </div>
                )}
              </div>
            )}

            {/* Preset Amount Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">Grant Contribution</label>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">
                  ≈ ₦{finalAmountNGN.toLocaleString()} NGN
                </span>
              </div>

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
              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
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
            </div>

            {/* Optional Memo */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Optional Donor Memo (Recorded on Stellar Ledger)
              </label>
              <input
                type="text"
                placeholder="e.g. Funding Dr. Adeyemi's malaria lab"
                value={donorMemo}
                onChange={(e) => setDonorMemo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Next Action */}
            <div className="pt-2 flex items-center gap-3">
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
          <div className="mt-4 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500">
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
            <p className="text-xs text-slate-500">
              {paymentRail === 'usdc'
                ? 'Review transaction details before cryptographically signing via Pollar.'
                : 'Review NGN conversion quote and on-ramp bridging into Stellar Soroban escrow.'}
            </p>

            {/* Detailed Transaction Sheet */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Grant Amount (USDC)</span>
                <span className="font-mono font-extrabold text-base text-slate-900">
                  ${finalAmount.toFixed(2)} USDC
                </span>
              </div>

              {paymentRail !== 'usdc' && (
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200 text-emerald-800">
                  <span className="font-medium">Fiat Charge (NGN)</span>
                  <span className="font-mono font-bold text-sm">
                    ₦{finalAmountNGN.toLocaleString()} NGN
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Payment Source</span>
                <span className="font-medium text-slate-800">
                  {paymentRail === 'usdc' 
                    ? `Pollar (${wallet.address?.slice(0, 8)}...${wallet.address?.slice(-4)})`
                    : paymentRail === 'ngn_card'
                      ? 'Nigerian Debit Card (Paystack Rail)'
                      : 'Direct NIP Bank Transfer'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Destination Escrow</span>
                <span className="font-mono text-cyan-800 font-medium">
                  {campaign.stellarEscrowAddress.slice(0, 16)}...
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Blockchain Network</span>
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

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
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
                <span>
                  {paymentRail === 'usdc' ? 'Sign & Broadcast Transaction' : `Pay ₦${finalAmountNGN.toLocaleString()} & Mint USDC`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE STELLAR CONSENSUS / ON-RAMP SIGNING STEPPER */}
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
                <span>
                  {paymentRail === 'usdc' ? 'Compiled Soroban Contract Envelope' : 'Verified NGN Fiat Payment Rail'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Pollar Paymaster Fee Sponsorship Granted</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Submitting to Stellar Horizon Testnet Consensus...</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: VERIFIED ON-CHAIN RECEIPT */}
        {modalStep === 4 && txReceipt && (
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Micro-Grant Verified on Stellar!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Your grant of <strong className="text-emerald-600 font-mono">${txReceipt.amount} USDC</strong>{' '}
                {txReceipt.ngnEquivalent ? `(₦${txReceipt.ngnEquivalent.toLocaleString()} NGN)` : ''} has been deposited into the lab's smart escrow.
              </p>
            </div>

            {/* Live On-Chain Receipt */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
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

              {txReceipt.fiatRef && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex justify-between">
                  <span>Paystack Anchor Ref:</span>
                  <span className="font-mono text-slate-900 font-semibold">{txReceipt.fiatRef}</span>
                </div>
              )}

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
