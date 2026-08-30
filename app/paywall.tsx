/**
 * Paywall Screen — One Minute to Live
 * Dark survival aesthetic with lime green / red accents.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PurchasesPackage } from "react-native-purchases";

import { useSubscription } from "@/contexts/SubscriptionContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const LOGO = require("@/assets/images/9fee1375-8957-4c34-ab24-126f70332eb4.jpeg");

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  surfaceSecondary: "#1C1C26",
  border: "rgba(255,255,255,0.06)",
  lime: "#A8E63D",
  limeMuted: "rgba(168,230,61,0.12)",
  red: "#FF4444",
  redMuted: "rgba(255,68,68,0.12)",
  text: "#F0F0F8",
  textSecondary: "#9090A8",
  textTertiary: "#5A5A72",
};

const FEATURES = [
  {
    icon: "⚡",
    title: "Extra Retries",
    description: "Get a second chance when the timer runs out",
  },
  {
    icon: "🎯",
    title: "Exclusive Scenarios",
    description: "Access premium survival challenges not available to free players",
  },
  {
    icon: "📊",
    title: "Advanced Stats",
    description: "Track your Survival IQ trends, best combos, and win streaks",
  },
  {
    icon: "🚫",
    title: "No Ads",
    description: "Pure survival, no interruptions",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const {
    packages,
    loading,
    isSubscribed,
    isWeb,
    purchasePackage,
    restorePurchases,
    mockWebPurchase,
    mockNativePurchase,
  } = useSubscription();

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(
    packages[0] || null
  );
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [webMockState, setWebMockState] = useState<"idle" | "processing">("idle");
  const [webMockDialogState, setWebMockDialogState] = useState<
    "hidden" | "selecting" | "failed"
  >("hidden");

  React.useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      setSelectedPackage(packages[0]);
    }
  }, [packages, selectedPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    console.log("[Paywall] Purchase pressed:", selectedPackage.identifier);
    try {
      setPurchasing(true);
      const success = await purchasePackage(selectedPackage);
      if (success) {
        console.log("[Paywall] Purchase succeeded");
        Alert.alert("You're Pro!", "Welcome to the full survival experience.", [
          { text: "Start Surviving", onPress: () => router.replace("/(tabs)/(play)") },
        ]);
      }
    } catch (error: any) {
      console.error("[Paywall] Purchase failed:", error);
      Alert.alert("Purchase Failed", error.message || "Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    console.log("[Paywall] Restore purchases pressed");
    try {
      setRestoring(true);
      const restored = await restorePurchases();
      if (restored) {
        console.log("[Paywall] Restore succeeded");
        Alert.alert("Restored!", "Your subscription has been restored.", [
          { text: "OK", onPress: () => router.replace("/(tabs)/(play)") },
        ]);
      } else {
        Alert.alert("No Purchases Found", "We couldn't find any previous purchases.");
      }
    } catch (error: any) {
      console.error("[Paywall] Restore failed:", error);
      Alert.alert("Restore Failed", error.message || "Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  const handleClose = () => {
    console.log("[Paywall] Dismissed (maybe later)");
    router.replace("/(tabs)/(play)");
  };

  const handleWebMockPurchase = async () => {
    if (!selectedPackage) return;
    console.log("[Paywall] Web mock purchase pressed:", selectedPackage.identifier);
    setWebMockState("processing");
    await new Promise((resolve) => setTimeout(resolve, 400));
    setWebMockState("idle");
    setWebMockDialogState("selecting");
  };

  const priceString = selectedPackage?.product?.priceString ?? "$7.99/mo";

  // Already subscribed
  if (isSubscribed) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.subscribedContent}>
            <Text style={{ fontSize: 72, marginBottom: 16 }}>⚡</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO SURVIVOR</Text>
            </View>
            <Text style={styles.subscribedTitle}>You're All Set!</Text>
            <Text style={styles.subscribedSubtitle}>
              Full survival mode unlocked
            </Text>
            <View style={styles.featuresCard}>
              {FEATURES.slice(0, 3).map((f, i) => (
                <View key={i} style={styles.featureCheckRow}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                  <Text style={styles.featureCheckText}>{f.title}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.ctaButton} onPress={handleClose}>
              <Text style={styles.ctaButtonText}>Start Surviving</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.lime} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 12, fontSize: 14 }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>SURVIVE LONGER</Text>
          <Text style={styles.subheadline}>Unlock the full survival experience</Text>

          {/* Features */}
          <View style={styles.featuresCard}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureIconText}>{feature.icon}</Text>
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Package selection */}
          {packages.length > 0 && (
            <View style={styles.packagesContainer}>
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.identifier === pkg.identifier;
                const pkgPrice = pkg.product.priceString ?? "";
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                    onPress={() => {
                      console.log("[Paywall] Package selected:", pkg.identifier);
                      setSelectedPackage(pkg);
                    }}
                  >
                    {isSelected && <View style={styles.packageTopBar} />}
                    <View style={styles.packageHeader}>
                      <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                      {isSelected && (
                        <View style={styles.checkmarkCircle}>
                          <Text style={styles.checkmark}>✓</Text>
                        </View>
                      )}
                    </View>
                    {pkgPrice ? (
                      <Text style={styles.packagePrice}>{pkgPrice}</Text>
                    ) : null}
                    {pkg.product.description ? (
                      <Text style={styles.packageDescription}>{pkg.product.description}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* No packages (Expo Go) */}
          {!isWeb && packages.length === 0 && !loading && (
            <View style={styles.noPackagesContainer}>
              <Text style={styles.noPackagesText}>
                Purchases are not available in standard Expo Go.
              </Text>
              <Text style={[styles.noPackagesText, { marginTop: 8, opacity: 0.6 }]}>
                Use a development build to test purchases.
              </Text>
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.devMockButton}
                  onPress={async () => {
                    console.log("[Paywall] Dev: simulate purchase");
                    await mockNativePurchase();
                    router.replace("/(tabs)/(play)");
                  }}
                >
                  <Text style={styles.devMockButtonText}>Dev: Simulate Purchase</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          {isWeb ? (
            <>
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  (!selectedPackage || webMockState === "processing") && styles.buttonDisabled,
                ]}
                onPress={handleWebMockPurchase}
                disabled={!selectedPackage || webMockState === "processing"}
              >
                {webMockState === "processing" ? (
                  <ActivityIndicator color={COLORS.bg} />
                ) : (
                  <Text style={styles.ctaButtonText}>Start Surviving</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
                {restoring ? (
                  <ActivityIndicator size="small" color={COLORS.textSecondary} />
                ) : (
                  <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.legalText}>
                Preview mode — purchases available in the mobile app
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  (!selectedPackage || purchasing) && styles.buttonDisabled,
                ]}
                onPress={handlePurchase}
                disabled={!selectedPackage || purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color={COLORS.bg} />
                ) : (
                  <Text style={styles.ctaButtonText}>Start Surviving</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
                {restoring ? (
                  <ActivityIndicator size="small" color={COLORS.textSecondary} />
                ) : (
                  <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.legalText}>
                {priceString}
                {" "}· Renews automatically ·{" "}
                {Platform.OS === "ios" ? "Apple ID" : "Google Play"} account
              </Text>
            </>
          )}

          <TouchableOpacity style={styles.dismissLink} onPress={handleClose}>
            <Text style={styles.dismissLinkText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Web mock dialog */}
      {isWeb && webMockDialogState !== "hidden" && (
        <View style={styles.webDialogOverlay}>
          <View style={styles.webDialogBox}>
            {webMockDialogState === "selecting" && (
              <>
                <Text style={styles.webDialogTitle}>Test Purchase</Text>
                <Text style={styles.webDialogBody}>
                  {`⚠️ Dev-only test purchase.\n\nPackage: ${selectedPackage?.identifier}\nPrice: ${selectedPackage?.product.priceString ?? "N/A"}`}
                </Text>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("failed")}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#FF3B30" }]}>
                    Test Failed Purchase
                  </Text>
                </TouchableOpacity>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => {
                    setWebMockDialogState("hidden");
                    mockWebPurchase();
                    router.replace("/(tabs)/(play)");
                  }}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#007AFF" }]}>
                    Test Valid Purchase
                  </Text>
                </TouchableOpacity>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("hidden")}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#007AFF" }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
            {webMockDialogState === "failed" && (
              <>
                <Text style={styles.webDialogTitle}>Purchase Failed</Text>
                <Text style={styles.webDialogBody}>
                  Test purchase failure: no real transaction occurred
                </Text>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("hidden")}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#007AFF" }]}>OK</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
  },

  // Logo
  logoContainer: {
    marginBottom: 24,
    shadowColor: COLORS.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 16,
  },

  // Headline
  headline: {
    fontFamily: "SpaceMono",
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.lime,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },

  // Features card
  featuresCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.limeMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  featureIconText: {
    fontSize: 20,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Packages
  packagesContainer: {
    gap: 10,
    width: "100%",
  },
  packageCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  packageCardSelected: {
    borderColor: COLORS.lime,
    backgroundColor: COLORS.limeMuted,
  },
  packageTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.lime,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    fontSize: 12,
    color: COLORS.bg,
    fontWeight: "bold",
  },
  packagePrice: {
    fontFamily: "SpaceMono",
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.lime,
    marginTop: 6,
  },
  packageDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // No packages
  noPackagesContainer: {
    padding: 24,
    alignItems: "center",
  },
  noPackagesText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  devMockButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    alignItems: "center",
  },
  devMockButtonText: {
    color: COLORS.textTertiary,
    fontSize: 13,
  },

  // Bottom actions
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  ctaButton: {
    backgroundColor: COLORS.lime,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonText: {
    color: COLORS.bg,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  restoreButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  restoreButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  legalText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: "center",
    lineHeight: 16,
  },
  dismissLink: {
    paddingVertical: 6,
    alignItems: "center",
  },
  dismissLinkText: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },

  // Subscribed state
  subscribedContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  proBadge: {
    backgroundColor: COLORS.limeMuted,
    borderWidth: 1,
    borderColor: COLORS.lime,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.lime,
    letterSpacing: 1.5,
  },
  subscribedTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subscribedSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 28,
  },
  featureCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.limeMuted,
    borderWidth: 1,
    borderColor: COLORS.lime,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkMark: {
    fontSize: 12,
    color: COLORS.lime,
    fontWeight: "bold",
  },
  featureCheckText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeBtnText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  // Web mock dialog
  webDialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  webDialogBox: {
    backgroundColor: "#1C1C26",
    borderRadius: 16,
    width: "85%",
    maxWidth: 400,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webDialogTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  webDialogBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    lineHeight: 18,
  },
  webDialogDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  webDialogButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  webDialogButtonText: {
    fontSize: 16,
  },
});
