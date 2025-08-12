/**
 * This file extends the global Window interface to include the ONTO wallet and Ethereum provider.
 */

declare global {
  interface Window {
    onto?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export {};
