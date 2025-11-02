# Legacy Protocol - Blockchain Integration Setup

## Overview
The blockchain integration has been completed. All pages now connect to your smart contracts and handle real transactions.

## Required Configuration

### 1. Contract Addresses

You need to set your deployed contract addresses. There are two ways:

#### Option A: Environment Variables (Recommended)
Create a `.env.local` file in the `legacy-protocol` directory:

```env
NEXT_PUBLIC_INHERITANCE_SWITCH_ADDRESS=0xYourInheritanceSwitchAddress
NEXT_PUBLIC_PYUSD_ADDRESS=0xYourPYUSDAddress
```

#### Option B: Update Config File
Edit `legacy-protocol/lib/config/contracts.ts` and add your addresses directly for the network you're using (mainnet chainId: 1, Sepolia: 11155111, etc.)

### 2. Network Configuration
Make sure your wallet is connected to the correct network where your contracts are deployed. The app will automatically detect the chain ID and use the appropriate contract addresses.

## Key Features Integrated

### Owner/Creator Features:
- ✅ Wallet connection
- ✅ Create legacy switch (with beneficiary, amount, timeout period, and optional data CID)
- ✅ Approve PYUSD tokens
- ✅ Initialize switch on-chain
- ✅ View dashboard with switch details
- ✅ Check-in functionality (resets timeout)
- ✅ Update beneficiary address
- ✅ Update data CID
- ✅ Cancel switch (returns funds)

### Beneficiary Features:
- ✅ Check switch status by owner address
- ✅ View active switches (not yet claimable)
- ✅ View claimable switches (timeout expired)
- ✅ Claim assets and data
- ✅ View final message/data CID after claiming

## Contract Methods Used

### InheritanceSwitch Contract:
- `initializeSwitch(beneficiary, amount, timeOutPeriod, dataCID)`
- `getMySwitchDetails()`
- `checkIn()`
- `cancelSwitch()`
- `updateBeneficiary(newBeneficiary)`
- `updateDataPointer(newCID)`
- `isClaimable(ownerAddress)`
- `isBeneficiary(ownerAddress)`
- `getSwitchAmount(ownerAddress)`
- `getSwitchDataCID(ownerAddress)`
- `claimAssets(ownerAddress)`

### ERC20 (PYUSD) Contract:
- `approve(spender, amount)`
- `allowance(owner, spender)`
- `balanceOf(address)`
- `decimals()`

## Important Notes

1. **PYUSD Decimals**: The code handles PYUSD decimals dynamically. PYUSD typically uses 6 decimals, but the code fetches this from the contract.

2. **Timeout Period**: The timeout period in the contract is stored in seconds. The UI converts days to seconds when creating a switch.

3. **Data CID**: The app supports storing a CID (Content Identifier) for encrypted messages stored on IPFS, Lighthouse, or other storage solutions. The actual message retrieval/decryption should be handled separately.

4. **Error Handling**: All contract interactions include error handling with user-friendly messages.

5. **Transaction Confirmation**: Users will need to confirm transactions in their wallet (MetaMask, etc.).

## Testing Checklist

- [ ] Set contract addresses in environment variables or config file
- [ ] Connect wallet to correct network
- [ ] Test creating a switch (approve + initialize)
- [ ] Test check-in functionality
- [ ] Test updating beneficiary
- [ ] Test updating data CID
- [ ] Test beneficiary checking switch status
- [ ] Test claiming assets (after timeout or in test mode)
- [ ] Test cancel switch

## Questions or Issues?

If you're confused about any part of the integration or need clarification, please let me know and I'll help resolve it!

