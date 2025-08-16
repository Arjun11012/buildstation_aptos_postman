import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  account: string | null;
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndSubmitTransaction: (payload: any) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check if wallet is already connected (from localStorage)
  useEffect(() => {
    const savedAddress = localStorage.getItem('aptos_wallet_address');
    if (savedAddress) {
      setAccount(savedAddress);
      setAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      // For demo purposes, we'll create a mock wallet address
      // In production, you'd integrate with Petra, Martian, or other wallets
      const mockAddress = '0x' + Math.random().toString(36).substr(2, 64);
      
      setAccount(mockAddress);
      setAddress(mockAddress);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem('aptos_wallet_address', mockAddress);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('aptos_wallet_address');
  };

  const signAndSubmitTransaction = async (payload: any): Promise<string> => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate transaction processing
      console.log('Transaction payload:', payload);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return mock transaction hash
      return '0x' + Math.random().toString(36).substr(2, 64);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const value: WalletContextType = {
    account,
    address,
    isConnected,
    connect,
    disconnect,
    signAndSubmitTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 