"use client";
import { useUmiMove } from '@/hooks/useUmiMove';
import { useWalletSigner } from '@/hooks/useWalletSigner';

export function MoveClaimRewardButton({ marketId }: { marketId: number }) {
  const { address, getSignature } = useWalletSigner();
  const { execute, loading, result, error } = useUmiMove();

  const handleClick = async () => {
    if (!address) return;
    const args = [marketId];
    const message = JSON.stringify({ function: '0xYourAddress::polymarket::claim_reward', args, sender: address });
    const signature = await getSignature(message);
    execute('0xYourAddress::polymarket::claim_reward', args, address, signature);
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading || !address}>
        Move ile Ödül Çek
      </button>
      {loading && <span>İşlem gönderiliyor...</span>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
} 