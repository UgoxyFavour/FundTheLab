import React, { useState } from 'react';
import { usePollarWallet } from '../context/PollarContext';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Loader2, 
  ExternalLink,
  Smartphone,
  Wallet,
  Clock,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NIGERIAN_BANKS = [
  { code: '058', name: 'GTBank (Guaranty Trust Bank)' },
  { code: '044', name: 'Access Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '035', name: 'Wema Bank / ALAT' },
  { code: '50211', name: 'Kuda Microfinance Bank' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '999992', name: 'OPAY Digital Services' },
  { code: '50644', name: 'Palmpay' }
];

const NGN_RATE = 1550; // 1 USDC = ₦1,550 NGN

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { wallet } = usePollarWallet();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amountUSDC, setAmountUSDC] = useState<number>(100);
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0].code);
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState('DR. BABATUNDE ADEYEMI - LAB ACCT');
  const [isResolving, setIsResolving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{
    reference: string;
    nipSession: string;
    amountNGN: number;
    amountUSDC: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    timestamp: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentBank = NIGERIAN_BANKS.find(b => b.code === selectedBank) || NIGERIAN_BANKS[0];
  const grossNGN = amountUSDC * NGN_RATE;
  const nipFee = 50; // ₦50 standard NIP fee
  const netNGN = Math.max(0, grossNGN - nipFee);

  const handleAccountChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    if (cleaned.length === 10) {
      setIsResolving(true);
      setTimeout(() => {
        setIsResolving(false);
        setAccountName('DR. BABATUNDE ADEYEMI - RESEARCH GRANTS ACCT');
      }, 600);
    } else {
      setAccountName('');
    }
  };

  const handleProceedToReview = () => {
    if (amountUSDC <= 0 || amountUSDC > wallet.balanceUSDC) return;
    if (accountNumber.length !== 10) return;
    setStep(2);
  };

  const handleExecuteWithdrawal = async () => {
    setIsProcessing(true);
    try {
      // Simulate Stellar Anchor burn and NIP dispatch
      await new Promise(r => setTimeout(r, 2200));

      const ref = `FTL-NIP-${Date.now().toString().slice(-8)}`;
      const nip = `9990${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      setReceipt({
        reference: ref,
        nipSession: nip,
        amountNGN: netNGN,
        amountUSDC,
        bankName: currentBank.name,
        accountNumber,
        accountName: accountName || 'DR. BABATUNDE ADEYEMI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Deduct from wallet balance locally
      wallet.balanceUSDC = Math.max(0, parseFloat((wallet.balanceUSDC - amountUSDC).toFixed(2)));

      setStep(3);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-cyan-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Withdraw to Nigerian Bank (NGN)</h3>
              <p className="text-xs text-slate-500">Stellar Anchor Off-Ramp via Cowrie & Pollar Rails</p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: AMOUNT & BANK SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Balance Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Available USDC</span>
                  <span className="text-xl font-bold font-mono text-slate-900">${wallet.balanceUSDC.toFixed(2)} USDC</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Live FX Rate</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">1 USDC = ₦{NGN_RATE.toLocaleString()} NGN</span>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Withdrawal Amount (USDC)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    max={wallet.balanceUSDC}
                    value={amountUSDC}
                    onChange={(e) => setAmountUSDC(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-28 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setAmountUSDC(wallet.balanceUSDC)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition"
                  >
                    MAX
                  </button>
                </div>
                {amountUSDC > wallet.balanceUSDC && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">Amount exceeds your available balance.</p>
                )}
              </div>

              {/* Converted NGN Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-900 font-medium">Expected Payout</span>
                </div>
                <span className="text-base font-extrabold font-mono text-emerald-700">
                  ₦{grossNGN.toLocaleString()} NGN
                </span>
              </div>

              {/* Bank Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Destination Nigerian Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 10-digit NUBAN Account */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">10-Digit NUBAN Account Number</label>
                  {isResolving && (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Resolving NUBAN...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. 0123456789"
                  value={accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  maxLength={10}
                  className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                {accountName && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs text-slate-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{accountName}</span>
                  </div>
                )}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleProceedToReview}
                disabled={amountUSDC <= 0 || amountUSDC > wallet.balanceUSDC || accountNumber.length !== 10}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-display font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 mt-4"
              >
                <span>Review Bank Payout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: REVIEW & ANCHOR LOCK */}
          {step === 2 && (
            <div className="space-y-4">
              
              <div className="text-center pb-2">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">NIBSS Instant Payment (NIP)</span>
                <h4 className="text-lg font-bold font-display text-slate-900">Authorize Off-Ramp Transfer</h4>
                <p className="text-xs text-slate-500">Stellar Anchor will burn USDC and dispatch direct NGN wire</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Withdrawal:</span>
                  <span className="font-mono font-bold text-slate-900">${amountUSDC.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Exchange Rate Locked:</span>
                  <span className="font-mono text-slate-900">1 USDC = ₦{NGN_RATE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Payout (NGN):</span>
                  <span className="font-mono text-slate-900">₦{grossNGN.toLocaleString()} NGN</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>NIP Interbank Settlement Fee:</span>
                  <span className="font-mono text-slate-900">₦{nipFee}.00 NGN</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Stellar Network Gas:</span>
                  <span className="font-medium text-emerald-600">0 XLM (Sponsored by Pollar)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Net Credit to Account:</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-base">₦{netNGN.toLocaleString()} NGN</span>
                </div>
              </div>

              {/* Beneficiary Details Box */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Beneficiary Details</div>
                <div className="font-bold text-slate-900">{accountName}</div>
                <div className="text-slate-600 font-mono">{accountNumber} • {currentBank.name}</div>
              </div>

              {/* Guarantee info */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero university overhead skim. Payout disbursed directly via Nigerian Interbank Settlement Scheme (NIBSS).</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteWithdrawal}
                  disabled={isProcessing}
                  className="flex-[2] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-display shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching NIP Wire...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Send ₦{netNGN.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: CONFIRMED NIP RECEIPT */}
          {step === 3 && receipt && (
            <div className="text-center py-2 space-y-4">
              
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold font-display text-slate-900">Transfer Successful!</h4>
                <p className="text-xs text-slate-500">Funds credited instantly to {receipt.bankName}</p>
              </div>

              {/* Big NGN Amount */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <div className="text-xs text-emerald-700 font-medium">Net Amount Dispatched</div>
                <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-0.5">
                  ₦{receipt.amountNGN.toLocaleString()} NGN
                </div>
                <div className="text-[11px] text-emerald-600 font-mono mt-1">
                  Debited: ${receipt.amountUSDC.toFixed(2)} USDC
                </div>
              </div>

              {/* Receipt Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary:</span>
                  <span className="font-bold text-slate-900">{receipt.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-mono text-slate-900">{receipt.accountNumber} ({receipt.bankName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIP Session ID:</span>
                  <span className="font-mono text-[11px] text-slate-700">{receipt.nipSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Anchor Ref:</span>
                  <span className="font-mono text-[11px] text-slate-700">{receipt.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Time:</span>
                  <span className="font-mono text-slate-900">{receipt.timestamp} (Instant)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-display font-semibold text-xs transition"
              >
                Close Receipt
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
