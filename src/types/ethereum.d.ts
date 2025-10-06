// MetaMask Ethereum provider types
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: any[];
      }) => Promise<any>;
      on?: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
      selectedAddress?: string;
      isMetaMask?: boolean;
      isTokenPocket?: boolean;
      isCoinbaseWallet?: boolean;
      providers?: any[];
    };
    tokenpocket?: any;
  }
}

export {};