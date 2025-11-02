'use client';

import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClaimConfirmationPage() {
  const { isConnected, account, claimAssets, getSwitchAmount, getSwitchDataCID, formatPYUSD, isLoading } = useWeb3();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<string>('');
  const [dataCID, setDataCID] = useState<string>('');

  const ownerAddress = searchParams.get('owner');

  useEffect(() => {
    if (!isConnected || !account || !ownerAddress) {
      router.push('/beneficiary');
      return;
    }

    const loadData = async () => {
      try {
        const switchAmount = await getSwitchAmount(ownerAddress);
        const cid = await getSwitchDataCID(ownerAddress);
        const formatted = await formatPYUSD(switchAmount);
        setAmount(formatted);
        setDataCID(cid);
      } catch (err) {
        console.error('Error loading data:', err);
        alert('Failed to load switch data');
        router.push('/beneficiary');
      }
    };

    loadData();
  }, [isConnected, account, ownerAddress, getSwitchAmount, getSwitchDataCID, formatPYUSD, router]);

  const handleClaim = async () => {
    if (!ownerAddress) return;

    try {
      await claimAssets(ownerAddress);
      router.push(`/beneficiary/success?owner=${encodeURIComponent(ownerAddress)}`);
    } catch (err: any) {
      alert(err.message || 'Failed to claim assets');
    }
  };

  if (!isConnected || !account || !ownerAddress) {
    return null;
  }

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#111722] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
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
                Switch
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
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Claim Confirmation
            </h2>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              You are about to claim {amount} PYUSD and the owner's final data. This will transfer the assets to your
              wallet and permanently close the switch.
            </p>
            <div className="flex px-4 py-3 justify-center">
              <button
                onClick={handleClaim}
                disabled={isLoading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 px-4 bg-[#1152d4] text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
              >
                <span className="truncate">{isLoading ? 'Processing...' : 'Confirm Claim'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
