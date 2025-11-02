'use client';

import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClaimSuccessPage() {
  const { isConnected, account, getSwitchDataCID, formatPYUSD, getSwitchAmount } = useWeb3();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<string>('');
  const [dataCID, setDataCID] = useState<string>('');

  const ownerAddress = searchParams.get('owner');

  useEffect(() => {
    if (!isConnected || !account) {
      router.push('/beneficiary');
      return;
    }

    const loadData = async () => {
      try {
        // Note: After claiming, the switch is no longer active, so we can't fetch from contract
        // In a real app, you might want to store this data in local storage or fetch from events
        // For now, we'll just show a success message
        setAmount(''); // Would be from previous page or local storage
        setDataCID(''); // Would be from previous page or local storage
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    loadData();
  }, [isConnected, account, router]);

  if (!isConnected || !account) {
    return null;
  }

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-neutral-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#ededed] px-10 py-3">
          <div className="flex items-center gap-4 text-[#141414]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#141414] text-lg font-bold leading-tight tracking-[-0.015em]">Legacy Protocol</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#141414] text-sm font-medium leading-normal" href="#">
                Dashboard
              </a>
              <a className="text-[#141414] text-sm font-medium leading-normal" href="#">
                Vault
              </a>
              <a className="text-[#141414] text-sm font-medium leading-normal" href="#">
                Beneficiaries
              </a>
              <a className="text-[#141414] text-sm font-medium leading-normal" href="#">
                Settings
              </a>
            </div>
            {account && (
              <div className="flex items-center gap-2">
                <div className="text-[#141414] text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</div>
              </div>
            )}
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-[#141414] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Claim Successful
            </h2>
            <p className="text-[#141414] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              The assets have been transferred to your wallet successfully.
            </p>
            {dataCID && (
              <>
                <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  The Owner's Final Message
                </h2>
                <p className="text-[#141414] text-base font-normal leading-normal pb-3 pt-1 px-4">
                  Data CID: {dataCID}
                  <br />
                  <br />
                  Note: You can retrieve the decrypted message using this CID from your storage provider (e.g., IPFS,
                  Lighthouse, etc.).
                </p>
              </>
            )}
            <div className="flex px-4 py-3 justify-center">
              <Link
                href="/dashboard"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#141414] text-neutral-50 text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
