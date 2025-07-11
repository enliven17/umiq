// Move fonksiyonu çağırmak için HTTP API fonksiyonu
export async function callMoveFunctionHttp(functionName: string, args: any[], sender: string, signature: string) {
  const res = await fetch('https://devnet.uminetwork.com/v1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      function: functionName, // örn: '0xYourAddress::polymarket::create_market'
      args,
      sender,
      signature, // wagmi ile signMessage sonucu
      // nonce, gas vb. gerekiyorsa ekle
    }),
  });
  return res.json();
} 