import { useAccount, useSignMessage } from 'wagmi';

export function useWalletSigner() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // signature almak için fonksiyon döndür
  const getSignature = async (message: string) => {
    return await signMessageAsync({ message });
  };

  return { address, getSignature };
} 