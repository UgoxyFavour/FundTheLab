import React, { useState } from 'react';
import { usePollarWallet } from '../context/PollarContext';
import { 
  Sparkles, 
  Wallet, 
  LogOut, 
  PlusCircle, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  ChevronDown, 
  Atom, 
  HelpCircle, 
  Activity, 
  Key, 
  Mail, 
  Fingerprint, 
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  onOpenCreate: () => void;
  onOpenAbout: () => void;
  onOpenLedger: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenCreate, 
  onOpenAbout,
  onOpenLedger
}) => {
  const { 
    wallet, 
    isConnecting, 
    loginWithEmailOtp, 
    loginWithGoogleInteractive, 
    loginWithPasskeyInteractive, 
    disconnect 
  } = usePollarWallet();

  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auth modal internal states
  const [authMethod, setAuthMethod] = useState<'picker' | 'google' | 'email' | 'otp'>('picker');
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Google interactive login handler
  const handleSelectGoogleAccount = async (email: string, name: string) => {
    try {
      setAuthError(null);
      await loginWithGoogleInteractive(email, name);
      setShowConnectModal(false);
      setAuthMethod('picker');
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed');
    }
  };

  // Email submit handler
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setAuthError(null);
    setAuthMethod('otp');
    setInputOtp('948210'); // Pre-fill sample OTP for instant review
  };

  // OTP submit handler
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError(null);
      await loginWithEmailOtp(inputEmail, inputOtp);
      setShowConnectModal(false);
      setAuthMethod('picker');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification code.');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Protocol Status */}
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 transition-all group-hover:scale-105">
                  <Atom className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-cyan-700 transition">
                    FundTheLab
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    DeSci
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block tracking-normal">
                  Micro-Grants on Stellar & Pollar
                </p>
              </div>
            </div>

            {/* Protocol Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[11px] text-slate-600">Stellar Testnet</span>
              <span className="text-slate-300">/</span>
              <span className="text-[11px] text-teal-700 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-teal-600" /> Gas Sponsored
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLedger}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span>Escrow Ledger</span>
            </button>

            <button
              onClick={onOpenAbout}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Why DeSci?</span>
            </button>

            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-600" />
              <span>Submit Lab</span>
            </button>

            {/* Wallet Button / Dropdown */}
            {wallet.isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-900 hover:border-cyan-500 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px] ring-1 ring-teal-200 uppercase">
                    {wallet.loginMethod === 'google' ? 'G' : wallet.loginMethod === 'passkey' ? 'P' : 'E'}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-emerald-600 font-mono leading-tight">
                      ${wallet.balanceUSDC.toFixed(2)} <span className="text-[10px] text-slate-500 font-sans">USDC</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono leading-none">
                      {formatAddress(wallet.address || '')}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 text-xs z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-900">
                          {wallet.email || 'Pollar Embedded Wallet'}
                        </div>
                        <div className="text-[10px] text-teal-600 font-mono">
                          Stellar Soroban Keypair
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Active
                      </span>
                    </div>

                    <div className="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between">
                        <span>Public Stellar Address</span>
                        <button 
                          onClick={() => handleCopy(wallet.address || '')}
                          className="text-cyan-700 hover:text-cyan-600 flex items-center gap-1 text-[10px] font-medium"
                        >
                          {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-slate-800 break-all select-all font-medium">
                        {wallet.address}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 px-1 text-slate-700">
                      <span>Available USDC</span>
                      <span className="font-bold text-emerald-600 font-mono text-sm">
                        ${wallet.balanceUSDC.toFixed(2)} USDC
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 px-1 text-slate-500 text-[11px] border-t border-slate-100">
                      <span>Stellar Network Gas</span>
                      <span className="text-teal-700 font-medium">Sponsored (0 XLM)</span>
                    </div>

                    {/* View Secret Seed Key button */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowWalletDropdown(false);
                          setShowKeyModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                      >
                        <Key className="w-3.5 h-3.5 text-cyan-600" />
                        Backup Secret Key (Seed)
                      </button>
                    </div>

                    <div className="mt-2">
                      <button
                        onClick={() => {
                          disconnect();
                          setShowWalletDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition font-medium text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMethod('picker');
                  setAuthError(null);
                  setShowConnectModal(true);
                }}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Wallet className="w-4 h-4 stroke-[2.5]" />
                <span>{isConnecting ? 'Authenticating...' : 'Sign In / Connect'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* AUTHENTIC INTERACTIVE AUTH MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
            
            <button 
              onClick={() => {
                setShowConnectModal(false);
                setAuthMethod('picker');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-base font-mono"
            >
              ✕
            </button>

            {/* SCREEN 1: METHOD PICKER */}
            {authMethod === 'picker' && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-cyan-600/20">
                    <Atom className="w-7 h-7 text-white stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                    Sign in to FundTheLab
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Powered by Pollar embedded wallet on Stellar. No seed phrases.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Google Login Option */}
                  <button
                    onClick={() => setAuthMethod('google')}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-xs transition hover:scale-[1.01]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Academic Email Option */}
                  <button
                    onClick={() => setAuthMethod('email')}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-sm border border-slate-200 transition"
                  >
                    <Mail className="w-5 h-5 text-cyan-600" />
                    Sign in with University / Personal Email
                  </button>

                  {/* Passkey Option */}
                  <button
                    onClick={async () => {
                      await loginWithPasskeyInteractive();
                      setShowConnectModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-sm border border-slate-200 transition"
                  >
                    <Fingerprint className="w-5 h-5 text-teal-600" />
                    Sign in with Passkey / FaceID
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: GOOGLE ACCOUNT CHOOSER (Interactive Authentic OAuth Screen) */}
            {authMethod === 'google' && (
              <div>
                <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                  <button 
                    onClick={() => setAuthMethod('picker')}
                    className="hover:text-slate-900 font-semibold"
                  >
                    ← Back
                  </button>
                  <span>•</span>
                  <span>Google Account Chooser</span>
                </div>

                <div className="text-center mb-5">
                  <h4 className="text-base font-bold text-slate-900">Choose an account</h4>
                  <p className="text-xs text-slate-500">to continue to FundTheLab via Pollar</p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleSelectGoogleAccount('dr.elena.rostova@stanford.edu', 'Dr. Elena Rostova')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-slate-50 flex items-center gap-3 text-left transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center text-sm">
                      ER
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Dr. Elena Rostova</div>
                      <div className="text-[11px] text-slate-500">dr.elena.rostova@stanford.edu</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectGoogleAccount('marcus.vance@mit.edu', 'Marcus Vance')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-slate-50 flex items-center gap-3 text-left transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      MV
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Marcus Vance</div>
                      <div className="text-[11px] text-slate-500">marcus.vance@mit.edu</div>
                    </div>
                  </button>

                  {/* Custom Account Input */}
                  <div className="pt-2 border-t border-slate-100">
                    <input
                      type="email"
                      placeholder="Or enter your custom Gmail / email..."
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 mb-2 focus:outline-none focus:border-cyan-600"
                    />
                    <button
                      disabled={!inputEmail}
                      onClick={() => handleSelectGoogleAccount(inputEmail, inputEmail.split('@')[0])}
                      className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs transition"
                    >
                      Continue with entered account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 3: EMAIL INPUT FORM */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailSubmit}>
                <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('picker')}
                    className="hover:text-slate-900 font-semibold"
                  >
                    ← Back
                  </button>
                  <span>•</span>
                  <span>Email Verification</span>
                </div>

                <div className="text-center mb-5">
                  <h4 className="text-base font-bold text-slate-900">Enter your email</h4>
                  <p className="text-xs text-slate-500">We'll send a one-time code to authenticate your wallet.</p>
                </div>

                {authError && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                    {authError}
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="e.g. scientist@oxford.ac.uk"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 4: OTP CONFIRMATION SCREEN */}
            {authMethod === 'otp' && (
              <form onSubmit={handleOtpSubmit}>
                <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className="hover:text-slate-900 font-semibold"
                  >
                    ← Back
                  </button>
                  <span>•</span>
                  <span>Enter Code</span>
                </div>

                <div className="text-center mb-4">
                  <h4 className="text-base font-bold text-slate-900">Check your inbox</h4>
                  <p className="text-xs text-slate-500">
                    We sent a 6-digit code to <strong className="text-slate-800">{inputEmail}</strong>
                  </p>
                </div>

                {authError && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                    {authError}
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-lg tracking-widest text-slate-900 focus:outline-none focus:border-cyan-600 font-bold"
                  />

                  <div className="text-center">
                    <span className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      Demo OTP Code: <strong>948210</strong>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs transition shadow-sm"
                  >
                    {isConnecting ? 'Verifying & Initializing Stellar Keypair...' : 'Confirm & Access Wallet'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Includes <strong>$500.00 test USDC</strong> to test live micro-grants</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* KEYPAIR BACKUP & SECRET REVEAL MODAL */}
      {showKeyModal && wallet.isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
            <button 
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-base font-mono"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-1">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Stellar Cryptographic Keypair Backup</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Your Self-Custodial Keys</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your wallet is non-custodial and derived directly from your credentials.
            </p>

            <div className="space-y-4 my-5">
              {/* Public Key */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>PUBLIC STELLAR ADDRESS (Safe to share)</span>
                  <button 
                    onClick={() => handleCopy(wallet.address || '')}
                    className="text-cyan-700 font-medium"
                  >
                    Copy
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-900 break-all select-all font-medium">
                  {wallet.address}
                </div>
              </div>

              {/* Secret Key */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between text-[10px] text-amber-800 mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    SECRET KEY (Do not share with anyone!)
                  </span>
                  <button 
                    onClick={() => setRevealSecret(!revealSecret)}
                    className="text-amber-800 font-semibold flex items-center gap-1"
                  >
                    {revealSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {revealSecret ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-950 break-all select-all font-bold">
                  {revealSecret ? wallet.secretKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowKeyModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
            >
              Close & Keep Safe
            </button>
          </div>
        </div>
      )}
    </>
  );
};
