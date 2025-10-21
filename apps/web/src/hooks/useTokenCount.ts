import { useState, useEffect } from 'react';
import type { UsageInfo } from '@example/types';

export function useTokenCount() {
  const [estimate, setEstimate] = useState<number | null>(null);
  const [actual, setActual] = useState<UsageInfo | null>(null);

  const setEstimateTokens = (tokens: number) => {
    setEstimate(tokens);
    setActual(null);
  };

  const setActualUsage = (usage: UsageInfo) => {
    setActual(usage);
  };

  const reset = () => {
    setEstimate(null);
    setActual(null);
  };

  return {
    estimate,
    actual,
    setEstimateTokens,
    setActualUsage,
    reset
  };
}
