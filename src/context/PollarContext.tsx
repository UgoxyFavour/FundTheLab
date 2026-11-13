import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balanceUSDC: number;
  loginMethod: 'google' | 'passkey' | 'email' | 'freighter' | null;
  email?: string;
  isSponsored: boolean; // Gasless by Pollar
  network: 'Stellar Testnet' | 'Stellar Mainnet';
}

interface PollarContextType {
  wallet: WalletState;
  isConnecting: boolean;
  connectWithGoogle: () => Promise<void>;
  connectWithPasskey: () => Promise<void>;
  disconnect: () => void;
  sendDonation: (params: {
    recipientEscrow: string;
    amountUSDC: number;
    campaignTitle: string;
    memo?: string;
  }) => Promise<{ txHash: string; success: boolean }>;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const PollarContext = createContext<PollarContextType | undefined>(undefined);

export const PollarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(
    import.meta.env.VITE_POLLAR_API_KEY || ''
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('fundthelab_wallet');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      isConnected: false,
      address: null,
      balanceUSDC: 0,
      loginMethod: null,
      isSponsored: true,
      network: 'Stellar Testnet'
    };
  });

  useEffect(() => {
    localStorage.setItem('fundthelab_wallet', JSON.stringify(wallet));
  }, [wallet]);

  const connectWithGoogle = async () => {
    setIsConnecting(true);
    try {
      // Simulate/trigger Pollar embedded authentication flow
      await new Promise(r => setTimeout(r, 900));
      const mockStellarAddress = 'G' + Array.from({ length: 55 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
      ).join('');

      setWallet({
        isConnected: true,
        address: mockStellarAddress,
        balanceUSDC: 350.00,
        loginMethod: 'google',
        email: 'researcher.alumni@stanford.edu',
        isSponsored: true,
        network: 'Stellar Testnet'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWithPasskey = async () => {
    setIsConnecting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const mockStellarAddress = 'G' + Array.from({ length: 55 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
      ).join('');

      setWallet({
        isConnected: true,
        address: mockStellarAddress,
        balanceUSDC: 500.00,
        loginMethod: 'passkey',
        email: 'passkey.user@biodev.org',
        isSponsored: true,
        network: 'Stellar Testnet'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      balanceUSDC: 0,
      loginMethod: null,
      isSponsored: true,
      network: 'Stellar Testnet'
    });
  };

  const sendDonation = async ({
    recipientEscrow,
    amountUSDC,
    campaignTitle,
    memo
  }: {
    recipientEscrow: string;
    amountUSDC: number;
    campaignTitle: string;
    memo?: string;
  }) => {
    if (!wallet.isConnected) {
      throw new Error('Please connect your Pollar wallet first.');
    }
    if (wallet.balanceUSDC < amountUSDC) {
      throw new Error(`Insufficient USDC balance. You have $${wallet.balanceUSDC} USDC.`);
    }

    // Simulate Stellar Soroban Escrow transaction via Pollar gasless runner
    await new Promise(r => setTimeout(r, 1200));

    // Deduct balance
    setWallet(prev => ({
      ...prev,
      balanceUSDC: Math.max(0, parseFloat((prev.balanceUSDC - amountUSDC).toFixed(2)))
    }));

    // Generate Stellar transaction hash
    const txHash = 'stellar_' + Array.from({ length: 48 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { txHash, success: true };
  };

  return (
    <PollarContext.Provider
      value={{
        wallet,
        isConnecting,
        connectWithGoogle,
        connectWithPasskey,
        disconnect,
        sendDonation,
        apiKey,
        setApiKey
      }}
    >
      {children}
    </PollarContext.Provider>
  );
};

export const usePollarWallet = () => {
  const context = useContext(PollarContext);
  if (!context) {
    throw new Error('usePollarWallet must be used within a PollarProvider');
  }
  return context;
};
