'use client';

import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';
import { useEffect, useState } from 'react';

export default function RoleSelectionPage() {
  const { isConnected, connectWallet, isLoading } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
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
                Help
              </a>
            </div>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAnYCP4lM2itHQS7WXn0AZKzuNFxu9Uq6FISNxsj3RjwhRfjQTiBBtqSUGYpA5UTqK79ExJAiIB7RsT0mGWwOYtspjmeFkHP5bZAGqHo3y2mViGsGVSkkKMP3VS5uoHAE5RU99o-H4flJznbGHa1d5CdyUlEWoVoWiP2l5QOnTmsVtSsvECj22nT-Ai4tkUCob_6Dz1oPS3ezYYVwVky0wHBuJ4HFHXYUjA4wKRnybmrj6iKKIByBi4xeWuVCf2etXsg7DD4cbG9Ipg")' }}
            ></div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Welcome to Legacy Protocol
            </h2>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Choose your role to get started.
            </p>
            <div className="flex justify-center">
              <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
                <Link
                  href="/dashboard/new"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#1152d4] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full"
                >
                  <span className="truncate">I want to create a Legacy Switch</span>
                </Link>
                <Link
                  href="/beneficiary"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#232f48] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full"
                >
                  <span className="truncate">I am a Beneficiary</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}