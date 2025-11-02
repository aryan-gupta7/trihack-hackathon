# Legacy Protocol: Your Digital Inheritance, Secured On-Chain

Legacy Protocol is a decentralized application that solves a critical and personal problem in the Web3 world: What happens to your digital assets when you're gone?

It is an autonomous, trustless inheritance system built on the blockchain. It allows any user to create a "digital legacy switch" by locking assets (like PYUSD) and a final encrypted message for a designated beneficiary. This legacy is automatically transferred only if the owner fails to prove they are still active, eliminating the need for lawyers, intermediaries, or trusted family members.

-----

## How It Works

### The Core Concept: A Web3 "Dead Man's Switch"

At its heart, the project is a "dead man's switch." An Owner locks assets and defines a "check-in" period (e.g., 90 days). To keep the switch from activating, the Owner must simply visit the dApp and click a **"Check In"** button within that period.

If the Owner misses a check-in and the timer expires, the smart contract automatically flags the switch as claimable. The designated Beneficiary can then connect to the protocol, prove their identity (by connecting their wallet), and instantly claim 100% of the assets and the final message.

### The User Workflows

The dApp features two distinct, secure, and simple user journeys:

#### 1\. The Owner (Creator) Workflow

  * **Connect & Define:** The Owner connects their wallet and navigates to the "Create Switch" flow.
  * **Set Terms:** They designate a single Beneficiary's wallet address, the amount of PYUSD to secure, and a "check-in" period (e.g., 30, 90, or 180 days).
  * **Leave a Message:** They can optionally add a `dataCID` (Content Identifier), which can point to an encrypted will, a final message, or other important data stored on a decentralized service like IPFS.
  * **Activate:** The Owner performs two simple transactions: first, to **Approve** the PYUSD transfer, and second, to **Activate** the switch, which locks the funds in the `InheritanceSwitch` smart contract and starts the timer.
  * **Maintain:** The Owner can visit their dashboard at any time to **"Check In"** (which resets the timer), update their beneficiary, or update their data CID. They can also cancel the switch at any time to instantly retrieve their funds.

#### 2\. The Beneficiary Workflow

  * **Check Status:** A Beneficiary can connect their wallet and enter the Owner's public address to check the status of a legacy switch.
  * **View Status:** The dApp will inform them of one of three states:
      * **Not Found:** They are not the beneficiary for this address, or no switch exists.
      * **Active:** They are the beneficiary, but the Owner is still actively checking in. The assets are not yet claimable.
      * **Claimable:** The Owner has missed their check-in\! The legacy is ready to be claimed.
  * **Claim Legacy:** If the switch is claimable, the Beneficiary simply clicks "Claim Assets".
  * **Receive:** The smart contract verifies they are the correct beneficiary and that the time has expired. It then instantly transfers the full PYUSD amount to their wallet and securely reveals the `dataCID` containing the Owner's final message.

-----

## Features

  * **Trustless Inheritance:** Implements a "dead man's switch" logic entirely on-chain. No intermediaries are required.
  * **Dual User Roles:** Clear, distinct, and secure user flows for "Owners" (creators) and "Beneficiaries" (claimants).
  * **Stablecoin Support:** Built to use **PYUSD**, protecting the value of the digital legacy from market volatility.
  * **Decentralized Data Legacy:** Includes a `string dataCID` field in the contract, allowing owners to link to an encrypted final message, will, or instructions stored on IPFS or other decentralized storage.
  * **Full On-Chain Management:** The owner has complete control via the dApp to:
      * `checkIn()`: Reset the inactivity timer.
      * `updateBeneficiary()`: Change the designated beneficiary at any time.
      * `updateDataPointer()`: Update the `dataCID` to point to a new message.
      * `cancelSwitch()`: Deactivate the switch and immediately withdraw all locked funds.
  * **Modern Full-Stack dApp:**
      * **Frontend:** Built with **Next.js 16** (App Router), **React 19**, and styled with **TailwindCSS**.
      * **Web3 Integration:** Uses **ethers.js v6** and a centralized React Context (`Web3Context.tsx`) to manage wallet connections, contract interactions, and application state.
  * **Secure and Event-Driven Contract:** The `InheritanceSwitch.sol` contract emits events for all critical actions (`switchCreated`, `checkedIn`, `switchClaimed`, etc.) for easy off-chain tracking.

-----

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### 4.1. Prerequisites

  * **Node.js** (v20.9.0 or later)
  * **NPM** or **Yarn**
  * A Web3 wallet (e.g., [MetaMask](https://metamask.io/)) connected to a test network (like Sepolia).
  * Testnet **PYUSD** tokens. You will need the contract address for the ERC20 token you wish to use (e.g., PYUSD on Sepolia).

### 4.2. Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/legacy-protocol.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd legacy-protocol
    ```
3.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### 4.3. Configuration

The project requires environment variables to connect to the correct smart contracts.

1.  Create a `.env.local` file in the root of the `legacy-protocol` directory:

    ```bash
    touch .env.local
    ```

2.  Add your deployed smart contract addresses to the `.env.local` file. The `SETUP.md` file and `lib/config/contracts.ts` show that you must provide the addresses for your `InheritanceSwitch` contract and the `PYUSD` token contract you are using.

    ```env
    NEXT_PUBLIC_INHERITANCE_SWITCH_ADDRESS=0xYourInheritanceSwitchContractAddress
    NEXT_PUBLIC_PYUSD_ADDRESS=0xYourPYUSDTokenContractAddress
    ```

### 4.4. Running Locally

Once installed and configured, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the application.

-----

## Usage

The dApp provides two primary user flows, accessible from the homepage (`/app/role/page.tsx`).

### As an Owner (Creator)

1.  Navigate to the homepage and select **"I want to create a Legacy Switch"**.
2.  You will be redirected to `/dashboard/new`. If your wallet is not connected, you'll be prompted to connect.
3.  Click **"Create My Switch"** to begin the flow.
4.  On `/create/beneficiary`, enter the wallet address of the person you want to designate as your beneficiary.
5.  On `/create/legacy`, define the terms:
      * The **amount of PYUSD** to secure.
      * The **"Check-in Period"** (e.g., 30, 90, or 180 days). This is the inactivity timer.
      * An optional **Encrypted Message (CID)** pointing to data on IPFS.
6.  On `/create/confirm`, you must complete two transactions:
      * **Step 1: Approve PYUSD Transfer**: This calls the `approve()` function on the PYUSD (ERC20) contract, allowing the `InheritanceSwitch` contract to pull the specified amount.
      * **Step 2: Activate Legacy Switch**: This calls the `initializeSwitch()` function on the `InheritanceSwitch` contract, locking your funds and starting the timer.
7.  After success, you are redirected to your `/dashboard`. From here, you can manage your active switch:
      * Click **"CHECK IN"** to reset your inactivity timer.
      * Click **"Update Beneficiary"** or **"Update Message"** to change your switch's details.
      * Click **"Cancel My Switch"** in the "Danger Zone" to permanently deactivate the switch and retrieve your funds.

### As a Beneficiary

1.  Navigate to the homepage and select **"I am a Beneficiary"**.
2.  On `/beneficiary`, connect your wallet and enter the **Owner's public wallet address** you want to check.
3.  Click **"Check Status"**. The app will check the blockchain and redirect you:
      * **/beneficiary/status-not-found**: If no switch exists for that owner, or if your wallet is not the designated beneficiary.
      * **/beneficiary/status-active**: If you are the correct beneficiary, but the owner is still actively checking in. The assets are not claimable.
      * **/beneficiary/status-claimable**: If you are the beneficiary and the owner has *missed* their check-in period.
4.  If the status is "Claimable," you can click **"Claim Legacy"**. This will execute the `claimAssets()` function, transferring the full PYUSD amount and the `dataCID` to your wallet.

### Smart Contract: `InheritanceSwitch.sol`

This is the core logic of the protocol. It is a single, event-driven contract that manages all legacy switches.

#### Core Data Structure

The state of each legacy is stored in a `Switch` struct, which is linked to an owner's address in the `ownerToSwitch` mapping:

```solidity
struct Switch {
    address beneficiary;    // The wallet that can claim the assets
    uint256 pyusdAmount;    // The amount of PYUSD locked
    uint256 lastCheckIn;    // The timestamp of the owner's last check-in
    string dataCID;         // A string (e.g., IPFS CID) for an off-chain message
    bool isClaimed;         // Flag if the beneficiary has already claimed
    bool isActive;          // Flag if the switch is active
    uint256 timeOutPeriod;  // The inactivity duration (in seconds)
}

mapping (address => Switch) public ownerToSwitch;
```

#### The "Dead Man's Switch" Mechanism

The entire protocol hinges on two key functions:

1.  **`checkIn()`**: This function can only be called by an active owner (`activeOwner` modifier). It performs a single action:

    ```solidity
    function checkIn() public activeOwner {
        ownerToSwitch[msg.sender].lastCheckIn = block.timestamp;  
        emit checkedIn(msg.sender, block.timestamp);
    }
    ```

2.  **`isClaimable()`**: This public view function allows anyone (like the frontend) to check if a switch is ready to be claimed. It returns `true` only if the switch is active AND the current time has passed the `lastCheckIn` time plus the `timeOutPeriod`.

    ```solidity
    function isClaimable(address _ownerAddress) public view returns(bool) {
        bool active = ownerToSwitch[_ownerAddress].isActive;
        bool timeExpired = block.timestamp > ownerToSwitch[_ownerAddress].lastCheckIn + ownerToSwitch[_ownerAddress].timeOutPeriod;
        return active && timeExpired;
    }
    ```

#### Key Owner Functions

  * **`initializeSwitch(address _beneficiary, uint _pyusdAmount, uint256 _timeOutPeriod)`**
    This function creates the switch. It requires that the owner has already approved the contract to spend their PYUSD. It transfers the tokens, sets the switch to `isActive = true`, and sets the initial `lastCheckIn` timestamp .

  * **`cancelSwitch()`**
    Allows the owner to deactivate their switch and withdraw their PYUSD. It transfers the full `pyusdAmount` back to the `msg.sender` and deletes the `Switch` struct from storage .

  * **`updateBeneficiary(address _newBeneficiary)`**
    Allows the owner to change the beneficiary address. It also resets the `lastCheckIn` timer as a safety measure .

  * **`updateDataPointer(string memory _newCID)`**
    Allows the owner to update the `dataCID` string .

#### Key Beneficiary Function

  * **`claimAssets(address _ownerAddress)`**
    This is the only function a beneficiary can call. It has two requirements:
    1.  `isClaimable(_ownerAddress)` must be true (the owner's timer must have expired) .
    2.  `msg.sender` must be the designated `beneficiary` .
        If both pass, it transfers the `pyusdAmount` to the beneficiary, sets `isActive = false`, and emits a `switchClaimed` event .

#### Events

The contract emits events for all significant state changes, allowing the dApp or indexers to monitor activity:

  * `switchCreated(address indexed owner, address indexed beneficiary, uint256 amount)`
  * `switchCancelled(address indexed owner, uint256 amount)`
  * `checkedIn(address indexed owner, uint256 timestamp)`
  * `beneficiaryUpdated(address indexed owner, address oldBeneficiary, address newBeneficiary)`
  * `dataCIDUpdated(address indexed owner, string dataCID)`
  * `switchClaimed(address indexed beneficiary, address indexed owner, string dataCID, uint256 amount)`

-----

## Deployment

This is a standard Next.js project. It can be deployed to any platform that supports Node.js, such as Vercel or Netlify.

1.  **Deploy Smart Contracts:** First, deploy the `InheritanceSwitch.sol` contract to your target network (e.g., Ethereum Mainnet, Sepolia, or a Layer 2). You will also need the official address of the PYUSD (or other ERC20) token on that network.
2.  **Set Environment Variables:** In your deployment provider's settings (e.g., Vercel Project Settings), add the environment variables from your `.env.local` file:
      * `NEXT_PUBLIC_INHERITANCE_SWITCH_ADDRESS`
      * `NEXT_PUBLIC_PYUSD_ADDRESS`
3.  **Deploy Frontend:** Connect your Git repository to the deployment provider and deploy.

-----

## Project Status

This project is a complete and functional full-stack decentralized application. It serves as a robust proof-of-concept and a practical tool for digital asset inheritance.

-----

## Contributing

Contributions are welcome\! If you have suggestions or find a bug, please feel free to:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

-----

## Project License

This project is licensed under the MIT License. The `InheritanceSwitch.sol` smart contract also uses the MIT License identifier .

-----

## References

  * [Next.js](https://nextjs.org/)
  * [React](https://react.dev/)
  * [ethers.js](https://ethers.io/)
  * [Solidity](https://soliditylang.org/)
  * [TailwindCSS](https://tailwindcss.com/)
  * [PayPal USD (PYUSD)](https://www.paypal.com/pyusd)
