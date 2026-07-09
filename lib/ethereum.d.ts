type EthereumRequest = {
  method: string;
  params?: unknown[];
};

type EthereumProvider = {
  isMiniPay?: boolean;
  request<T = unknown>(request: EthereumRequest): Promise<T>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
