"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ARCHITECTURE_DAILY_CREDITS } from "@/lib/defaultArchitecture";

const CREDITS_STORAGE_KEY = "architecture-daily-credits";

type StoredCreditState = {
  credits: number;
  lastReset: string;
};

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function normalizeCreditsState(state?: Partial<StoredCreditState>): StoredCreditState {
  const todayKey = getTodayKey();

  if (!state?.lastReset || state.lastReset !== todayKey) {
    return {
      credits: ARCHITECTURE_DAILY_CREDITS,
      lastReset: todayKey,
    };
  }

  return {
    credits: typeof state.credits === "number" ? state.credits : ARCHITECTURE_DAILY_CREDITS,
    lastReset: state.lastReset,
  };
}

export function useCredits() {
  const [creditState, setCreditState] = useState<StoredCreditState>(() =>
    normalizeCreditsState({
      credits: ARCHITECTURE_DAILY_CREDITS,
      lastReset: getTodayKey(),
    })
  );

  useEffect(() => {
    const stored = localStorage.getItem(CREDITS_STORAGE_KEY);

    if (!stored) {
      setCreditState(normalizeCreditsState());
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredCreditState;
      setCreditState(normalizeCreditsState(parsed));
    } catch {
      setCreditState(normalizeCreditsState());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(creditState));
  }, [creditState]);

  const consumeCredits = useCallback((amount: number) => {
    let consumed = false;

    setCreditState((currentState) => {
      const normalized = normalizeCreditsState(currentState);

      if (normalized.credits < amount) {
        return normalized;
      }

      consumed = true;
      return {
        ...normalized,
        credits: normalized.credits - amount,
      };
    });

    return consumed;
  }, []);

  const restoreCredits = useCallback(() => {
    const normalized = normalizeCreditsState();
    setCreditState(normalized);
    return normalized;
  }, []);

  const progress = useMemo(
    () => Math.max(0, Math.min(100, (creditState.credits / ARCHITECTURE_DAILY_CREDITS) * 100)),
    [creditState.credits]
  );

  return {
    credits: creditState.credits,
    dailyLimit: ARCHITECTURE_DAILY_CREDITS,
    lastReset: creditState.lastReset,
    progress,
    consumeCredits,
    restoreCredits,
  };
}
