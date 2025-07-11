import { useState } from 'react';
import { callMoveFunctionHttp } from '@/api/umiMove';

export function useUmiMove() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    functionName: string,
    args: unknown[],
    sender: string,
    signature: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const tx = await callMoveFunctionHttp(functionName, args, sender, signature);
      setResult(tx);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Unknown error');
      }
    }
    setLoading(false);
  };

  return { execute, loading, result, error };
} 