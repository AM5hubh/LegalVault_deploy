/**
 * Thirdweb Client Initialization
 * Creates a client instance for wallet connections and blockchain interactions
 */

import { createThirdwebClient, defineChain } from "thirdweb";

// Enforce providing a real Thirdweb client ID; default-client-id causes 401s
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
  // Fail fast with a clear message so we don't hammer unauthorized endpoints
  throw new Error(
    "VITE_THIRDWEB_CLIENT_ID is missing. Create one in the Thirdweb dashboard and add it to your .env.local/.env file.",
  );
}

// Initialize the thirdweb client with the provided project/client ID
export const client = createThirdwebClient({
  clientId,
});

// Define localhost chain for local development (Hardhat)
export const localhostChain = defineChain({
  id: 1337,
  rpc: "http://127.0.0.1:8545",
});

export default client;
