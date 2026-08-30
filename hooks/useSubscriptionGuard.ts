import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useGame } from "@/contexts/GameContext";

export function useSubscriptionGuard() {
  const { isSubscribed, loading } = useSubscription();
  const { onboardingComplete, isLoading: gameLoading } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (loading || gameLoading) return;
    if (!onboardingComplete) return;
    if (!isSubscribed) {
      router.replace("/paywall");
    }
  }, [isSubscribed, loading, gameLoading, onboardingComplete, router]);
}
