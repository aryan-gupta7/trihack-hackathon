'use client';

import { useWeb3 } from '../../context/Web3Context';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StatusActivePage() {
  const { isConnected, account, getSwitchDetails, formatPYUSD, inheritanceSwitchContract } = useWeb3();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [switchDetails, setSwitchDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formattedAmount, setFormattedAmount] = useState<string>('');

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
        // Try to get switch details - ownerToSwitch is public, so beneficiaries can read it
        const details = await getSwitchDetails(ownerAddress);
        if (details) {
          setSwitchDetails(details);
          const formatted = await formatPYUSD(details.pyusdAmount);
          setFormattedAmount(formatted);
          setError(null);
        } else {
          setError('Switch not found or inactive');
        }
      } catch (err: any) {
        console.error('Error loading switch details:', err);
        setError(err.message || 'Failed to load switch details. Make sure you are the beneficiary of this switch.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isConnected, account, ownerAddress, getSwitchDetails, inheritanceSwitchContract, router]);

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#111722]">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center items-center py-5">
            <p className="text-white text-base">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const nextClaimableDate = switchDetails
    ? new Date(
        (Number(switchDetails.lastCheckIn) + Number(switchDetails.timeOutPeriod)) * 1000
      ).toLocaleDateString()
    : '';

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
                  d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"
                  fill="currentColor"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">The Legacy Protocol</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#">
                Dashboard
              </a>
              <a className="text-white text-sm font-medium leading-normal" href="#">
                My Legacy
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
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Beneficiary Status</p>
            </div>
            <div className="flex items-center gap-4 bg-[#111722] px-4 min-h-14">
              <div
                className="text-white flex items-center justify-center rounded-lg bg-[#232f48] shrink-0 size-10"
                data-icon="ShieldCheck"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"></path>
                </svg>
              </div>
              <p className="text-white text-base font-normal leading-normal flex-1 truncate">
                Verified: You are the beneficiary.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-[#111722] px-4 min-h-14">
              <div
                className="text-white flex items-center justify-center rounded-lg bg-[#232f48] shrink-0 size-10"
                data-icon="ToggleLeft"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M176,56H80a72,72,0,0,0,0,144h96a72,72,0,0,0,0-144Zm0,128H80A56,56,0,0,1,80,72h96a56,56,0,0,1,0,112ZM80,88a40,40,0,1,0,40,40A40,40,0,0,0,80,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,152Z"></path>
                </svg>
              </div>
              <p className="text-white text-base font-normal leading-normal flex-1 truncate">
                Active. The owner is checking in normally.
              </p>
            </div>
            <p className="text-[#92a4c9] text-sm font-normal leading-normal pb-3 pt-1 px-4">
              Next Claimable After: {nextClaimableDate}
            </p>
            {error && (
              <div className="px-4 py-2 mx-4 mb-4 bg-red-500/20 border border-red-500 rounded">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {switchDetails && (
              <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                  <p className="text-[#92a4c9] text-sm font-normal leading-normal">Owner Address</p>
                  <p className="text-white text-sm font-normal leading-normal">{ownerAddress}</p>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                  <p className="text-[#92a4c9] text-sm font-normal leading-normal">Assets Amount</p>
                  <p className="text-white text-sm font-normal leading-normal">
                    {formattedAmount || 'Loading...'} PYUSD
                  </p>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                  <p className="text-[#92a4c9] text-sm font-normal leading-normal">Data CID</p>
                  <p className="text-white text-sm font-normal leading-normal">
                    {switchDetails.dataCID || 'No data stored'}
                  </p>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                  <p className="text-[#92a4c9] text-sm font-normal leading-normal">Last Check-in</p>
                  <p className="text-white text-sm font-normal leading-normal">
                    {new Date(Number(switchDetails.lastCheckIn) * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#324467] py-5">
                  <p className="text-[#92a4c9] text-sm font-normal leading-normal">Timeout Period</p>
                  <p className="text-white text-sm font-normal leading-normal">
                    {Math.floor(Number(switchDetails.timeOutPeriod) / (24 * 60 * 60))} days
                  </p>
                </div>
              </div>
            )}
            <div className="flex px-4 py-3">
              <button
                disabled
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#232f48] text-white text-sm font-bold leading-normal tracking-[0.015em] opacity-50 cursor-not-allowed"
              >
                <span className="truncate">Claim Assets & Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
