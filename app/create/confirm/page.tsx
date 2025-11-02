'use client';

import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatEther } from 'ethers';

export default function CreateConfirmPage() {
  const {
    isConnected,
    account,
    approvePYUSD,
    initializeSwitch,
    getPYUSDAllowance,
    getPYUSDBalance,
    chainId,
    isLoading,
    switchToSepolia,
  } = useWeb3();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<string>('');
  const [allowance, setAllowance] = useState<string>('');
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);

  const beneficiary = searchParams.get('beneficiary');
  const amount = searchParams.get('amount');
  const period = Number(searchParams.get('period'));
  const unixPeriod = period;
  
  const message = searchParams.get('message') || '';

  useEffect(() => {
    if (!isConnected || !account || !beneficiary || !amount || !period) {
      router.push('/create/beneficiary');
      return;
    }

    const loadData = async () => {
      try {
        if (!chainId) return;
        const inheritanceSwitchAddress = (await import('@/lib/config/contracts')).getContractAddress(
          chainId,
          'INHERITANCE_SWITCH'
        );

        const bal = await getPYUSDBalance();
        const allow = await getPYUSDAllowance(account, inheritanceSwitchAddress);
        const decimals = 18; // PYUSD uses 18 decimals
        const amountBigInt = BigInt(Math.floor(parseFloat(amount || '0') * 10 ** decimals));

        setBalance(bal);
        setAllowance(formatEther(allow));

        if (allow >= amountBigInt) {
          setStep1Done(true);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, [isConnected, account, beneficiary, amount, period, getPYUSDBalance, getPYUSDAllowance, chainId]);

  const formatEtherValue = (value: bigint | string): string => {
    if (typeof value === 'string') return value;
    return formatEther(value);
  };

  const handleApprove = async () => {
    if (!amount) return;

    try {
      await approvePYUSD(amount);
      setStep1Done(true);
      alert('PYUSD approved successfully!');
      
      // Reload allowance
      if (chainId && account) {
        const inheritanceSwitchAddress = (await import('@/lib/config/contracts')).getContractAddress(
          chainId,
          'INHERITANCE_SWITCH'
        );
        const allow = await getPYUSDAllowance(account, inheritanceSwitchAddress);
        setAllowance(formatEtherValue(allow));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to approve PYUSD';
      
      // Check if it's a wrong network error
      if (errorMessage.includes('Wrong network') || errorMessage.includes('Chain ID') || (chainId && chainId !== 11155111)) {
        const shouldSwitch = confirm(
          `You are on Chain ID ${chainId || 'unknown'}, but Sepolia (Chain ID: 11155111) is required.\n\n` +
          'Would you like to switch to Sepolia testnet now?'
        );
        
        if (shouldSwitch) {
          try {
            await switchToSepolia();
            // Page will reload automatically after network switch
          } catch (switchErr: any) {
            alert(`Failed to switch network: ${switchErr.message || switchErr}`);
          }
        }
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleInitialize = async () => {
    if (!beneficiary || !amount || !period) return;

    try {
      await initializeSwitch(beneficiary, amount, unixPeriod, message);
      setStep2Done(true);
      router.push('/create/success');
    } catch (err: any) {
      alert(err.message || 'Failed to initialize switch');
    }
  };

  if (!isConnected || !account || !beneficiary || !amount || !period) {
    return null;
  }

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#111722] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#232f48] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Legacy Protocol</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Dashboard
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Switches
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Beneficiaries
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Settings
              </a>
            </div>
            {account && (
              <div className="flex items-center gap-2">
                <div className="text-white text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</div>
              </div>
            )}
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Confirm Legacy Switch</p>
            </div>
            <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                <p className="text-[#92a4c9] text-sm font-normal leading-normal">Beneficiary</p>
                <p className="text-white text-sm font-normal leading-normal">{beneficiary}</p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                <p className="text-[#92a4c9] text-sm font-normal leading-normal">Amount</p>
                <p className="text-white text-sm font-normal leading-normal">{amount} PYUSD</p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                <p className="text-[#92a4c9] text-sm font-normal leading-normal">Check-in Period</p>
                <p className="text-white text-sm font-normal leading-normal">{period} days</p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                <p className="text-[#92a4c9] text-sm font-normal leading-normal">Your Balance</p>
                <p className="text-white text-sm font-normal leading-normal">{balance} PYUSD</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
                <button
                  onClick={handleApprove}
                  disabled={isLoading || step1Done}
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-white text-sm font-bold leading-normal tracking-[0.015em] w-full ${
                    step1Done ? 'bg-green-600' : 'bg-[#1152d4]'
                  } disabled:opacity-50`}
                >
                  <span className="truncate">
                    {step1Done ? '✓ Step 1: PYUSD Approved' : isLoading ? 'Processing...' : 'Step 1: Approve PYUSD Transfer'}
                  </span>
                </button>
                <button
                  onClick={handleInitialize}
                  disabled={isLoading || !step1Done || step2Done}
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-white text-sm font-bold leading-normal tracking-[0.015em] w-full ${
                    step2Done ? 'bg-green-600' : step1Done ? 'bg-[#1152d4]' : 'bg-[#232f48]'
                  } disabled:opacity-50`}
                >
                  <span className="truncate">
                    {step2Done
                      ? '✓ Step 2: Switch Activated'
                      : isLoading
                      ? 'Processing...'
                      : step1Done
                      ? 'Step 2: Activate Legacy Switch'
                      : 'Step 2: Activate Legacy Switch (Complete Step 1 first)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
