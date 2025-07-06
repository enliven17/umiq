"use client";
import { useUmiMove } from '@/hooks/useUmiMove';
import { useWalletSigner } from '@/hooks/useWalletSigner';

export function MoveCreateMarketButton() {
  const { address, getSignature } = useWalletSigner();
  const { execute, loading, result, error } = useUmiMove();

  const handleClick = async () => {
    if (!address) return;
    const args = [
      Buffer.from('Trump 2025', 'utf-8').toString('hex'),
      Buffer.from('Will Trump be president?', 'utf-8').toString('hex'),
      10000000000000000, // min_bet (0.01 ETH)
      1000000000000000000, // max_bet (1 ETH)
      Math.floor(Date.now() / 1000) + 86400, // closes_at (timestamp)
      100000000000000000, // initial_pool (0.1 ETH)
    ];
    const message = JSON.stringify({ function: '0xYourAddress::polymarket::create_market', args, sender: address });
    const signature = await getSignature(message);
    execute('0xYourAddress::polymarket::create_market', args, address, signature);
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading || !address}>
        Move ile Market Aç
      </button>
      {loading && <span>İşlem gönderiliyor...</span>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
} 