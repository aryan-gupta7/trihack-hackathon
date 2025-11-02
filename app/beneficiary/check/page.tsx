'use client';

import { useWeb3 } from '../../context/Web3Context';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BeneficiaryCheckPage() {
  const { isConnected, account, getSwitchDetails, isSwitchClaimable, isBeneficiary, inheritanceSwitchContract } = useWeb3();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [switchDetails, setSwitchDetails] = useState<any>(null);
  const [claimable, setClaimable] = useState(false);
  const [isBeneficiaryOf, setIsBeneficiaryOf] = useState(false);

  const ownerAddress = searchParams.get('owner');

  useEffect(() => {
    if (!isConnected || !account || !ownerAddress) {
      router.push('/beneficiary');
      return;
    }

    // Wait for contract to initialize
    if (!inheritanceSwitchContract) {
      return;
    }

    const checkStatus = async () => {
      try {
        // First, try to get switch details using the public mapping
        const details = await getSwitchDetails(ownerAddress);
        if (!details || !details.isActive) {
          console.log('Switch not found or inactive for owner:', ownerAddress);
          router.push(`/beneficiary/status-not-found?owner=${encodeURIComponent(ownerAddress || '')}`);
          return;
        }

        setSwitchDetails(details);

        // Check if current account is the beneficiary
        const beneficiaryStatus = await isBeneficiary(ownerAddress);
        console.log('Beneficiary status:', beneficiaryStatus, 'for owner:', ownerAddress, 'account:', account);
        
        if (!beneficiaryStatus) {
          console.log('Current account is not the beneficiary');
          router.push(`/beneficiary/status-not-found?owner=${encodeURIComponent(ownerAddress || '')}`);
          return;
        }

        setIsBeneficiaryOf(beneficiaryStatus);

        // Check if switch is claimable
        const claimableStatus = await isSwitchClaimable(ownerAddress);
        setClaimable(claimableStatus);

        if (claimableStatus) {
          router.push(`/beneficiary/status-claimable?owner=${encodeURIComponent(ownerAddress)}`);
        } else {
          router.push(`/beneficiary/status-active?owner=${encodeURIComponent(ownerAddress)}`);
        }
      } catch (err: any) {
        console.error('Error checking status:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          data: err.data,
        });
        router.push(`/beneficiary/status-not-found?owner=${encodeURIComponent(ownerAddress || '')}`);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [isConnected, account, ownerAddress, getSwitchDetails, isSwitchClaimable, isBeneficiary, inheritanceSwitchContract, router]);

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#111722]">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center items-center py-5">
            <p className="text-white text-base">Checking switch status...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

