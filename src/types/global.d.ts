interface Window {
  ethereum?: {
    isMetaMask?: true;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    request?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
    enable?: () => void;
  };
  web3?: {};
}

declare module 'content-hash' {
  declare function decode(x: string): string;
  declare function getCodec(x: string): string;
}

declare module 'multihashes' {
  declare function decode(buff: Uint8Array): {
    code: number;
    name: string;
    length: number;
    digest: Uint8Array;
  };
  declare function toB58String(hash: Uint8Array): string;
}

declare module '*.svg' {
  const content: any;
  export default content;
}
interface ValidRefTarget {
  contains(target: EventTarget | null): any;
}
