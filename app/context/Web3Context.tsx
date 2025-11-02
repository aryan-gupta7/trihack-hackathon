'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther, formatUnits, parseUnits } from 'ethers';
import InheritanceSwitchABI from '@/lib/abi/InheritanceSwitchABI.json';
import ERC20ABI from '@/lib/abi/ERC20ABI.json';
import { getContractAddress } from '@/lib/config/contracts';

// Types
export interface SwitchDetails {
  beneficiary: string;
  pyusdAmount: bigint;
  lastCheckIn: bigint;
  dataCID: string;
  isClaimed: boolean;
  isActive: boolean;
  timeOutPeriod: bigint;
}

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: any;
  
  // Contract instances
  inheritanceSwitchContract: Contract | null;
  pyusdContract: Contract | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Connection methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  
  // Contract read methods
  getSwitchDetails: (ownerAddress?: string) => Promise<SwitchDetails | null>;
  isSwitchClaimable: (ownerAddress: string) => Promise<boolean>;
  isBeneficiary: (ownerAddress: string) => Promise<boolean>;
  getSwitchAmount: (ownerAddress: string) => Promise<bigint>;
  getSwitchDataCID: (ownerAddress: string) => Promise<string>;
  getPYUSDBalance: (address?: string) => Promise<string>;
  getPYUSDAllowance: (ownerAddress: string, spenderAddress: string) => Promise<bigint>;
  getTimeRemaining: (ownerAddress: string) => Promise<number>;
  
  // Contract write methods
  approvePYUSD: (amount: string) => Promise<void>;
  initializeSwitch: (beneficiary: string, amount: string, timeOutPeriod: number, dataCID?: string) => Promise<void>;
  checkIn: () => Promise<void>;
  cancelSwitch: () => Promise<void>;
  claimAssets: (ownerAddress: string) => Promise<void>;
  updateBeneficiary: (newBeneficiary: string) => Promise<void>;
  updateDataPointer: (newCID: string) => Promise<void>;
  
  // Utility
  formatPYUSD: (amount: bigint | string) => Promise<string>;
  parsePYUSD: (amount: string) => bigint;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [inheritanceSwitchContract, setInheritanceSwitchContract] = useState<Contract | null>(null);
  const [pyusdContract, setPyusdContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contracts when provider/signer changes
  useEffect(() => {
    if (!provider || !signer || !chainId) {
      setInheritanceSwitchContract(null);
      setPyusdContract(null);
      return;
    }

    try {
      const inheritanceSwitchAddress = getContractAddress(chainId, 'INHERITANCE_SWITCH');
      const pyusdAddress = getContractAddress(chainId, 'PYUSD');

      const inheritanceSwitch = new Contract(
        inheritanceSwitchAddress,
        InheritanceSwitchABI,
        signer
      );

      const pyusd = new Contract(
        pyusdAddress,
        ERC20ABI,
        signer
      );

      setInheritanceSwitchContract(inheritanceSwitch);
      setPyusdContract(pyusd);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize contracts');
      console.error('Contract initialization error:', err);
    }
  }, [provider, signer, chainId]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_accounts', []);
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            
            setProvider(provider);
            setSigner(signer);
            setAccount(accounts[0]);
            setChainId(Number(network.chainId));
            setIsConnected(true);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      if (provider) {
        const signer = await provider.getSigner();
        setSigner(signer);
      }
    }
  };

  const handleChainChanged = async (chainId: string) => {
    window.location.reload();
  };

  const switchToSepolia = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask or other Ethereum wallet not found.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const chainId = '0xaa36a7'; // 11155111 in hex
      
      try {
        // Try to switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902 || switchError.code === -32603) {
          // Add Sepolia to MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainId,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.org', 'https://ethereum-sepolia-rpc.publicnode.com'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          // Try switching again after adding
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
          });
        } else {
          throw switchError;
        }
      }
      
      // Reload to update contracts with new chain ID
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to switch to Sepolia testnet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask or other Ethereum wallet not found. Please install MetaMask.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setInheritanceSwitchContract(null);
    setPyusdContract(null);
  };

  // Read methods
  const getSwitchDetails = async (ownerAddress?: string): Promise<SwitchDetails | null> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const address = ownerAddress || account;
      if (!address) {
        throw new Error('No address provided');
      }

      // Try to read from the public mapping - this works for both owners and beneficiaries
      const switchData = await inheritanceSwitchContract.ownerToSwitch(address);
      
      // Check if switch is active
      if (!switchData.isActive) {
        return null;
      }

      // Return switch details - ownerToSwitch is public, so beneficiaries can read it
      return {
        beneficiary: switchData.beneficiary,
        pyusdAmount: switchData.pyusdAmount,
        lastCheckIn: switchData.lastCheckIn,
        dataCID: switchData.dataCID,
        isClaimed: switchData.isClaimed,
        isActive: switchData.isActive,
        timeOutPeriod: switchData.timeOutPeriod,
      };
    } catch (err: any) {
      // Handle "missing revert data" errors - this might happen if contract doesn't exist or switch not found
      if (
        err.code === 'CALL_EXCEPTION' ||
        err.message?.includes('missing revert data') ||
        err.message?.includes('Switch already exists') ||
        err.message?.includes('not active')
      ) {
        return null;
      }
      // Re-throw other errors
      throw err;
    }
  };

  const isSwitchClaimable = async (ownerAddress: string): Promise<boolean> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await inheritanceSwitchContract.isClaimable(ownerAddress);
    } catch (err) {
      console.error('Error checking if claimable:', err);
      return false;
    }
  };

  const isBeneficiary = async (ownerAddress: string): Promise<boolean> => {
    if (!inheritanceSwitchContract || !account) {
      return false;
    }

    try {
      return await inheritanceSwitchContract.isBeneficiary(ownerAddress);
    } catch (err) {
      console.error('Error checking beneficiary status:', err);
      return false;
    }
  };

  const getSwitchAmount = async (ownerAddress: string): Promise<bigint> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    return await inheritanceSwitchContract.getSwitchAmount(ownerAddress);
  };

  const getSwitchDataCID = async (ownerAddress: string): Promise<string> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    return await inheritanceSwitchContract.getSwitchDataCID(ownerAddress);
  };

  const getPYUSDBalance = async (address?: string): Promise<string> => {
    if (!pyusdContract) {
      throw new Error('PYUSD contract not initialized');
    }

    const addr = address || account;
    if (!addr) {
      throw new Error('No address provided');
    }

    const balance = await pyusdContract.balanceOf(addr);
    const decimals = await pyusdContract.decimals();
    return formatUnits(balance, decimals);
  };

  const getPYUSDAllowance = async (ownerAddress: string, spenderAddress: string): Promise<bigint> => {
    if (!pyusdContract) {
      throw new Error('PYUSD contract not initialized');
    }

    return await pyusdContract.allowance(ownerAddress, spenderAddress);
  };

  const getTimeRemaining = async (ownerAddress: string): Promise<number> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Get switch details to calculate time remaining correctly
      // The contract's timeOutPeriod function is incorrect - it returns elapsed time after expiration
      // We need to calculate remaining time before expiration
      const switchData = await inheritanceSwitchContract.ownerToSwitch(ownerAddress);
      
      if (!switchData.isActive) {
        return 0;
      }

      const lastCheckIn = Number(switchData.lastCheckIn);
      const timeOutPeriod = Number(switchData.timeOutPeriod);
      const nextClaimable = lastCheckIn + timeOutPeriod;
      
      // Get current block timestamp (approximate using Date.now() / 1000)
      // For more accuracy, we could fetch the latest block, but this is close enough
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const remaining = nextClaimable - currentTimestamp;
      
      return Math.max(0, remaining); // Return 0 if time has already expired
    } catch (err) {
      console.error('Error getting time remaining:', err);
      return 0;
    }
  };

  // Write methods
  const approvePYUSD = async (amount: string): Promise<void> => {
    if (!chainId) {
      throw new Error('Chain ID not detected. Please connect your wallet.');
    }
    
    // Check if on correct network
    if (chainId !== 11155111) {
      throw new Error(`Wrong network detected. You are on Chain ID ${chainId}, but Sepolia (Chain ID: 11155111) is required. Please switch to Sepolia testnet.`);
    }
    
    if (!pyusdContract || !inheritanceSwitchContract) {
      throw new Error('Contracts not initialized. Please ensure your wallet is connected and contract addresses are configured in your .env.local file.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const inheritanceSwitchAddress = getContractAddress(chainId, 'INHERITANCE_SWITCH');
      const decimals = await pyusdContract.decimals();
      const amountParsed = parseUnits(amount, decimals);
      
      const tx = await pyusdContract.approve(inheritanceSwitchAddress, amountParsed);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to approve PYUSD');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const initializeSwitch = async (
    beneficiary: string,
    amount: string,
    timeOutPeriod: number, // This is the number of days
    dataCID: string = ''
  ): Promise<void> => {
    if (!inheritanceSwitchContract || !pyusdContract) {
      throw new Error('Contracts not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const decimals = await pyusdContract.decimals();
      const amountParsed = parseUnits(amount, decimals);
      const timeOutPeriodSeconds = timeOutPeriod * 24 * 60 * 60; // Convert days to seconds

      console.log('Step 1: Initializing switch...');
      // Step 1: Call initializeSwitch with 3 arguments + options object
      const tx = await inheritanceSwitchContract.initializeSwitch(
        beneficiary,
        amountParsed,
        timeOutPeriodSeconds,
        { gasLimit: 500000 } // Pass options as the LAST argument
      );
      await tx.wait();
      console.log('Step 1 Complete: Switch initialized.');

      // Step 2: If there is a message, call updateDataPointer in a separate transaction
      if (dataCID && dataCID.trim() !== '') {
        console.log('Step 2: Updating data pointer...');
        const tx2 = await inheritanceSwitchContract.updateDataPointer(dataCID, { gasLimit: 200000 });
        await tx2.wait();
        console.log('Step 2 Complete: Data pointer updated.');
      }

    } catch (err: any) {
      console.error('Failed to initialize switch:', err);
      setError(err.message || 'Failed to initialize switch');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const checkIn = async (): Promise<void> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await inheritanceSwitchContract.checkIn();
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to check in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSwitch = async (): Promise<void> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await inheritanceSwitchContract.cancelSwitch();
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel switch');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const claimAssets = async (ownerAddress: string): Promise<void> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await inheritanceSwitchContract.claimAssets(ownerAddress);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to claim assets');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBeneficiary = async (newBeneficiary: string): Promise<void> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await inheritanceSwitchContract.updateBeneficiary(newBeneficiary);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to update beneficiary');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDataPointer = async (newCID: string): Promise<void> => {
    if (!inheritanceSwitchContract) {
      throw new Error('Contract not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await inheritanceSwitchContract.updateDataPointer(newCID);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to update data pointer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions
  // Cache for PYUSD decimals to avoid repeated calls
  let pyusdDecimalsCache: number | null = null;

  const formatPYUSD = async (amount: bigint | string): Promise<string> => {
    if (typeof amount === 'string') {
      return amount;
    }
    
    // Fetch decimals from contract if not cached
    if (!pyusdDecimalsCache && pyusdContract) {
      try {
        pyusdDecimalsCache = await pyusdContract.decimals();
      } catch (err) {
        console.error('Error fetching PYUSD decimals, defaulting to 18:', err);
        pyusdDecimalsCache = 18; // Fallback to 18 decimals
      }
    }
    
    // Use cached decimals or default to 18
    const decimals = pyusdDecimalsCache ?? 18;
    return formatUnits(amount, decimals);
  };

  const parsePYUSD = (amount: string): bigint => {
    return parseEther(amount);
  };

  const value: Web3ContextType = {
    isConnected,
    account,
    chainId,
    provider,
    signer,
    inheritanceSwitchContract,
    pyusdContract,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    getSwitchDetails,
    isSwitchClaimable,
    isBeneficiary,
    getSwitchAmount,
    getSwitchDataCID,
    getPYUSDBalance,
    getPYUSDAllowance,
    getTimeRemaining,
    approvePYUSD,
    initializeSwitch,
    checkIn,
    cancelSwitch,
    claimAssets,
    updateBeneficiary,
    updateDataPointer,
    formatPYUSD,
    parsePYUSD,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

