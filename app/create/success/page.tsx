'use client';

import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSuccessPage() {
  const { isConnected, account } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected || !account) {
      router.push('/role');
    }
  }, [isConnected, account, router]);
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
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAzKRA1g9mdI8EVE40zpNCPCmX0Ld1PXTWUlBBxrRGDZh7yQHO784okwRKad2HDZBdxRRmp9MuUWu3K1kUmK0rntlM8OOGewnAWkWJjfff8ZaBQkdqfZuXfM1jg3WIAbEBwBtN5irPh0PxAphMY1f6g1jAFhqbY8eBibkM8aIuezHSWYNliWg0Aee60NDHRESjUByXn3JpGhQ6w60PAmCKpYoMQR3BCyfWPYbEBMWdnzX-SEeToUjGgBadp6aeGwnYSutzOVRjeMS9X")' }}
            ></div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#111722] @[480px]:rounded-xl min-h-[218px]"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAgAQmWGZRykSKxESBKcnkrVxeHPzJwL0Udwkgr172MjEj7L-0ft0ijf_MDnZxtgQVmYsFgeiEcirxXIEz0ql2iJpXnrT0Qp-tTAnXTd7mvB2ET26QNJm81khZtDOYW20loTzjLwde8DYOMLrwIqprxDKMkXVR-Tw80X-GTLognWP9ZRbqGoWrJJT-1FQmPAzwS_FuRfNo3yMhEeNFpGzxhEQloenDv55BwHsDJX1N8TZFFuPVB-t7suPzV6K76xlZZO6pQxSSBMu4C")' }}
                ></div>
              </div>
            </div>
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Legacy Switch Activated
            </h2>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Your 'heartbeat' timer has begun. You can manage your switch from your dashboard.
            </p>
            <div className="flex px-4 py-3 justify-center">
              <Link
                href="/dashboard"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1152d4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Go to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}