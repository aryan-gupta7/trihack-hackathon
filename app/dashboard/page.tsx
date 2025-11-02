'use client';

import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const {
    isConnected,
    account,
    getSwitchDetails,
    checkIn,
    cancelSwitch,
    updateBeneficiary,
    updateDataPointer,
    formatPYUSD,
    isLoading,
    error,
  } = useWeb3();
  const router = useRouter();
  const [switchDetails, setSwitchDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newCID, setNewCID] = useState('');
  const [showUpdateBeneficiary, setShowUpdateBeneficiary] = useState(false);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [formattedAmount, setFormattedAmount] = useState<string>('');

  useEffect(() => {
    if (!isConnected || !account) {
      router.push('/dashboard/new');
      return;
    }

    const loadData = async () => {
      try {
        const details = await getSwitchDetails();
        if (!details || !details.isActive) {
          router.push('/dashboard/new');
          return;
        }
        setSwitchDetails(details);
        const formatted = await formatPYUSD(details.pyusdAmount);
        setFormattedAmount(formatted);
        calculateTimeRemaining(details);
      } catch (err) {
        console.error('Error loading switch details:', err);
        router.push('/dashboard/new');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(() => {
      if (switchDetails) {
        calculateTimeRemaining(switchDetails);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected, account, getSwitchDetails, router]);

  const calculateTimeRemaining = (details: any) => {
    if (!details) return;
    const lastCheckIn = Number(details.lastCheckIn) * 1000;
    const timeoutPeriod = Number(details.timeOutPeriod) * 1000;
    const nextClaimable = lastCheckIn + timeoutPeriod;
    const now = Date.now();
    const remaining = nextClaimable - now;

    if (remaining <= 0) {
      setTimeRemaining('Claimable now');
      return;
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    setTimeRemaining(`${days} Days, ${hours} Hours, ${minutes} Mins`);
  };

  const handleCheckIn = async () => {
    try {
      await checkIn();
      const details = await getSwitchDetails();
      if (details) {
        setSwitchDetails(details);
        calculateTimeRemaining(details);
      }
      alert('Check-in successful!');
    } catch (err: any) {
      alert(err.message || 'Failed to check in');
    }
  };

  const handleCancelSwitch = async () => {
    if (!confirm('Are you sure you want to cancel your switch? This action cannot be undone.')) {
      return;
    }

    try {
      await cancelSwitch();
      alert('Switch cancelled successfully');
      router.push('/dashboard/new');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel switch');
    }
  };

  const handleUpdateBeneficiary = async () => {
    if (!newBeneficiary || !/^0x[a-fA-F0-9]{40}$/.test(newBeneficiary)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    try {
      await updateBeneficiary(newBeneficiary);
      alert('Beneficiary updated successfully');
      setShowUpdateBeneficiary(false);
      setNewBeneficiary('');
      const details = await getSwitchDetails();
      if (details) setSwitchDetails(details);
    } catch (err: any) {
      alert(err.message || 'Failed to update beneficiary');
    }
  };

  const handleUpdateDataPointer = async () => {
    if (!newCID.trim()) {
      alert('Please enter a valid CID');
      return;
    }

    try {
      await updateDataPointer(newCID);
      alert('Data pointer updated successfully');
      setShowUpdateMessage(false);
      setNewCID('');
      const details = await getSwitchDetails();
      if (details) setSwitchDetails(details);
    } catch (err: any) {
      alert(err.message || 'Failed to update data pointer');
    }
  };

  if (loading) {
    return (
      <div
        className="relative flex h-auto min-h-screen w-full flex-col bg-[#111722] dark group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center items-center py-5">
            <p className="text-white text-base">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!switchDetails) {
    return null;
  }

  const lastCheckInDate = new Date(Number(switchDetails.lastCheckIn) * 1000).toLocaleDateString();
  const nextClaimableDate = new Date(
    (Number(switchDetails.lastCheckIn) + Number(switchDetails.timeOutPeriod)) * 1000
  ).toLocaleDateString();

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
                Settings
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Help
              </a>
            </div>
            {account && (
              <div className="flex items-center gap-2">
                <div className="text-white text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</div>
              </div>
            )}
          </div>
        </header>
        {error && (
          <div className="px-40 py-2">
            <div className="bg-red-500 text-white p-2 rounded">{error}</div>
          </div>
        )}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p>
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Heartbeat
            </h2>
            <div className="p-4 @container">
              <div className="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAFfqBIqUP3pCCDjDENj-BQrykcnzM-VO3wcIdqt3LIMQOkhskcEGp1ozQoClqljYlHvPt5hZjR4fJlELi_Bcdep8upK-uC0bd4cdDrWB5DKMKlE25iYHRs_O3eUmdJ37iWnoCvSOCs4Zbn-am9fGFcynimM6yrBZzr2mBi6XpnwQEXyrPAS0K-m8SyRQQuG1z78lEQTSjAV8dNiN7kxQElLwzb9OEfH0H9xlmCaZwnc4_uXSXxjrwcpeffmpT0W3GWGt264lAZPu6U")',
                  }}
                ></div>
                <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
                  <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Time remaining until next check-in
                  </p>
                  <div className="flex items-end gap-3 justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#92a4c9] text-base font-normal leading-normal">{timeRemaining}</p>
                      <p className="text-[#92a4c9] text-base font-normal leading-normal">
                        Last check-in: {lastCheckInDate} Next claimable date: {nextClaimableDate}
                      </p>
                    </div>
                    <button
                      onClick={handleCheckIn}
                      disabled={isLoading}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#1152d4] text-white text-sm font-medium leading-normal disabled:opacity-50"
                    >
                      <span className="truncate">{isLoading ? 'Processing...' : 'CHECK IN'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Switch Management
            </h2>
            <div className="flex items-center gap-4 bg-[#111722] px-4 min-h-[72px] py-2 justify-between">
              <div className="flex flex-col justify-center">
                <p className="text-white text-base font-medium leading-normal line-clamp-1">Beneficiary</p>
                <p className="text-[#92a4c9] text-sm font-normal leading-normal line-clamp-2">
                  {switchDetails.beneficiary}
                </p>
              </div>
              <div className="shrink-0">
                {showUpdateBeneficiary ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBeneficiary}
                      onChange={(e) => setNewBeneficiary(e.target.value)}
                      placeholder="New beneficiary address"
                      className="px-2 py-1 rounded text-black text-sm"
                    />
                    <button
                      onClick={handleUpdateBeneficiary}
                      disabled={isLoading}
                      className="px-3 py-1 bg-[#1152d4] text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowUpdateBeneficiary(false);
                        setNewBeneficiary('');
                      }}
                      className="px-3 py-1 bg-[#232f48] text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowUpdateBeneficiary(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#232f48] text-white text-sm font-medium leading-normal w-fit"
                  >
                    <span className="truncate">Update Beneficiary</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#111722] px-4 min-h-[72px] py-2 justify-between">
              <div className="flex flex-col justify-center">
                <p className="text-white text-base font-medium leading-normal line-clamp-1">Secured Assets</p>
                <p className="text-[#92a4c9] text-sm font-normal leading-normal line-clamp-2">
                  {formattedAmount || 'Loading...'} PYUSD
                </p>
              </div>
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Encrypted Message
            </h2>
            <div className="flex items-center gap-4 bg-[#111722] px-4 min-h-[72px] py-2 justify-between">
              <div className="flex flex-col justify-center">
                <p className="text-white text-base font-medium leading-normal line-clamp-1">Message</p>
                <p className="text-[#92a4c9] text-sm font-normal leading-normal line-clamp-2">
                  {switchDetails.dataCID || 'No message stored'}
                </p>
              </div>
              <div className="shrink-0">
                {showUpdateMessage ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCID}
                      onChange={(e) => setNewCID(e.target.value)}
                      placeholder="New CID"
                      className="px-2 py-1 rounded text-black text-sm"
                    />
                    <button
                      onClick={handleUpdateDataPointer}
                      disabled={isLoading}
                      className="px-3 py-1 bg-[#1152d4] text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowUpdateMessage(false);
                        setNewCID('');
                      }}
                      className="px-3 py-1 bg-[#232f48] text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowUpdateMessage(true)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#232f48] text-white text-sm font-medium leading-normal w-fit"
                  >
                    <span className="truncate">Update Message</span>
                  </button>
                )}
              </div>
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Danger Zone
            </h2>
            <div className="p-4 @container">
              <div className="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAj2PKHfGWx_3rTL1gwHAWF-1BylA4yHYrpUz9eSjnoTpSVeOdc9knG9aP9gEUfRKjp4GiLC-JpSXQD6dTPlqIjVEhb6LS9WQXy5T-9K2TiKQhaKOE7d-dDHxUbJyLAdU9vOJ8zzy_olvqL2mpxIy0rfQkAEWhS1cmdIbPLza-Fjtqb3skOjsV3q0SA1QwCoU67d6KoczfgltuCQl3vJfawXhiNuRc-g04lluJar174afL_VGg5eKUyjvr0wN9S0_ogiDZ6Ogjs8wF-")',
                  }}
                ></div>
                <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
                  <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Cancel My Switch</p>
                  <div className="flex items-end gap-3 justify-between">
                    <p className="text-[#92a4c9] text-base font-normal leading-normal">
                      Canceling your switch will permanently delete all associated data and assets. This action cannot be
                      undone.
                    </p>
                    <button
                      onClick={handleCancelSwitch}
                      disabled={isLoading}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#1152d4] text-white text-sm font-medium leading-normal disabled:opacity-50"
                    >
                      <span className="truncate">{isLoading ? 'Processing...' : 'Cancel My Switch'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
