'use client';

import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StatusClaimablePage() {
  const { isConnected, account, getSwitchDetails, getSwitchAmount, formatPYUSD, inheritanceSwitchContract } = useWeb3();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>('');
  const [switchDetails, setSwitchDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const ownerAddress = searchParams.get('owner');

  useEffect(() => {
    if (!isConnected || !account || !ownerAddress) {
      router.push('/beneficiary');
      return;
    }

    if (!inheritanceSwitchContract) {
      return; // Wait for contract to initialize
    }

    const loadData = async () => {
      try {
        // Try to get switch details using the public mapping
        const details = await getSwitchDetails(ownerAddress);
        if (details) {
          setSwitchDetails(details);
          const formatted = await formatPYUSD(details.pyusdAmount);
          setAmount(formatted);
          setError(null);
        } else {
          // Fallback to getSwitchAmount if getSwitchDetails fails
          const switchAmount = await getSwitchAmount(ownerAddress);
          const formatted = await formatPYUSD(switchAmount);
          setAmount(formatted);
        }
      } catch (err: any) {
        console.error('Error loading switch details:', err);
        // Try fallback to getSwitchAmount
        try {
          const switchAmount = await getSwitchAmount(ownerAddress);
          const formatted = await formatPYUSD(switchAmount);
          setAmount(formatted);
        } catch (fallbackErr: any) {
          setError(err.message || 'Failed to load switch details. Make sure you are the beneficiary of this switch.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isConnected, account, ownerAddress, getSwitchDetails, getSwitchAmount, formatPYUSD, inheritanceSwitchContract, router]);

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#112217]">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center items-center py-5">
            <p className="text-white text-base">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#112217] dark group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#23482f] px-10 py-3">
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
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h1 className="text-white tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
              CLAIMABLE
            </h1>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              The owner has missed their scheduled check-in. You are now able to claim the legacy assets and data.
            </p>
            {error && (
              <div className="px-4 py-2 mx-4 mb-4 bg-red-500/20 border border-red-500 rounded">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#326744] py-5">
                <p className="text-[#92c9a4] text-sm font-normal leading-normal">Owner Address</p>
                <p className="text-white text-sm font-normal leading-normal">{ownerAddress}</p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#326744] py-5">
                <p className="text-[#92c9a4] text-sm font-normal leading-normal">Assets to Claim</p>
                <p className="text-white text-sm font-normal leading-normal">{amount || 'Loading...'} PYUSD</p>
              </div>
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#326744] py-5">
                <p className="text-[#92c9a4] text-sm font-normal leading-normal">Data CID</p>
                <p className="text-white text-sm font-normal leading-normal">
                  {switchDetails?.dataCID || 'No data stored'}
                </p>
              </div>
              {switchDetails && (
                <>
                  <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#326744] py-5">
                    <p className="text-[#92c9a4] text-sm font-normal leading-normal">Last Check-in</p>
                    <p className="text-white text-sm font-normal leading-normal">
                      {new Date(Number(switchDetails.lastCheckIn) * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#326744] py-5">
                    <p className="text-[#92c9a4] text-sm font-normal leading-normal">Timeout Period</p>
                    <p className="text-white text-sm font-normal leading-normal">
                      {Math.floor(Number(switchDetails.timeOutPeriod) / (24 * 60 * 60))} days
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex px-4 py-3 justify-center">
              <Link
                href={`/beneficiary/claim?owner=${encodeURIComponent(ownerAddress || '')}`}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#13ec5b] text-[#112217] text-base font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Claim Legacy</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
