'use client';

import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBeneficiaryPage() {
  const { isConnected, account } = useWeb3();
  const router = useRouter();
  const [beneficiary, setBeneficiary] = useState('');

  if (!isConnected || !account) {
    router.push('/role');
    return null;
  }

  const handleContinue = () => {
    if (!beneficiary || !/^0x[a-fA-F0-9]{40}$/.test(beneficiary)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    router.push(`/create/legacy?beneficiary=${encodeURIComponent(beneficiary)}`);
  };

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
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">Who is your beneficiary?</p>
                <p className="text-[#92a4c9] text-sm font-normal leading-normal">
                  This is the only address that can receive your assets and data if your switch becomes inactive.
                </p>
              </div>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  placeholder="Beneficiary's Wallet Address (0x...)"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-[#324467] bg-[#192233] focus:border-[#324467] h-14 placeholder:text-[#92a4c9] p-[15px] text-base font-normal leading-normal"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
              </label>
            </div>
            <div className="flex px-4 py-3 justify-end">
              <button
                onClick={handleContinue}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1152d4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Continue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
