"use client";

import { useMemo, useState } from "react";

export function useExecutionCredits(initialCredits: number) {
  const [remainingCredits, setRemainingCredits] = useState(initialCredits);

  const api = useMemo(
    () => ({
      remainingCredits,
      hasEnoughCredits(cost: number) {
        return remainingCredits >= cost;
      },
      consume(cost: number) {
        if (remainingCredits < cost) {
          return false;
        }

        setRemainingCredits((current) => current - cost);
        return true;
      },
      reset() {
        setRemainingCredits(initialCredits);
      },
    }),
    [initialCredits, remainingCredits]
  );

  return api;
}
