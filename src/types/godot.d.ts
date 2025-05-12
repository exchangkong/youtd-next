 
interface Window {
  Engine: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (config: any): any;
    getMissingFeatures(): string[];
  };
  set_wallet_address?: (address: string) => void;
}
