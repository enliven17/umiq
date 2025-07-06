"use client";
import { useUmiMove } from '@/hooks/useUmiMove';
import { useWalletSigner } from '@/hooks/useWalletSigner';

export function MoveCloseMarketButton({ marketId, result }: { marketId: number, result: 0 | 1 }) {
  const { address, getSignature } = useWalletSigner();
  const { execute, loading, result: txResult, error } = useUmiMove();

  const handleClick = async () => {
    if (!address) return;
    const args = [marketId, result];
    const message = JSON.stringify({ function: '0xYourAddress::polymarket::close_market', args, sender: address });
    const signature = await getSignature(message);
    execute('0xYourAddress::polymarket::close_market', args, address, signature);
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading || !address}>
        Move ile Marketi Kapat
      </button>
      {loading && <span>İşlem gönderiliyor...</span>}
      {txResult && <pre>{JSON.stringify(txResult, null, 2)}</pre>}
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
} 