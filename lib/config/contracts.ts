// Contract addresses - UPDATE THESE WITH YOUR DEPLOYED CONTRACT ADDRESSES
export const CONTRACT_ADDRESSES = {
  11155111: { // Sepolia testnet
    // Replace with your Sepolia testnet contract addresses
    INHERITANCE_SWITCH: process.env.NEXT_PUBLIC_INHERITANCE_SWITCH_ADDRESS || '0x0000000000000000000000000000000000000000',
    PYUSD: process.env.NEXT_PUBLIC_PYUSD_ADDRESS || '0x0000000000000000000000000000000000000000',
  }
} as const;

// Get contract address for current chain
export const getContractAddress = (chainId: number, contract: 'INHERITANCE_SWITCH' | 'PYUSD'): string => {
  const chainConfig = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!chainConfig) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }
  const address = chainConfig[contract];
  if (!address) {
    throw new Error(`${contract} address not configured for chain ${chainId}`);
  }
  return address;
};

