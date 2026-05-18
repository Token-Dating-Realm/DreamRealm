/**
 * Mobile entry screen (Dashboard / Home).
 *
 * Shows a branded welcome, user email if authenticated, and placeholder
 * module buttons for Discover, Matches, Messages, Streams, Events, Wallet.
 *
 * TODO: Replace with tab-based navigator and real data screens.
 */

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "expo-router";

const MODULES = [
  { name: "Discover", description: "Explore nearby profiles" },
  { name: "Matches", description: "Your connections" },
  { name: "Messages", description: "Chat" },
  { name: "Streams", description: "Live channels" },
  { name: "Events", description: "Local meetups" },
  { name: "Wallet", description: "DreamCoin" },
];

export default function HomeScreen() {
  const { user, profile, signOut, isLoading, isProfileLoading } = useAuth();
  const router = useRouter();

  // Redirect to onboarding if authenticated but no profile exists
  useEffect(() => {
    if (user && !isProfileLoading && !profile) {
      router.push("/onboarding");
    }
  }, [user, profile, isProfileLoading, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-text-muted">Loading session...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-2xl font-bold text-primary">DreamRealm</Text>
        <Text className="mb-6 text-text-muted">Sign in to continue</Text>
        <TouchableOpacity
          className="w-full rounded-lg bg-primary px-4 py-3"
          activeOpacity={0.8}
        >
          <Text className="text-center font-semibold text-white">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3 w-full rounded-lg border border-border px-4 py-3" activeOpacity={0.8}>
          <Text className="text-center font-semibold text-text">Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-border bg-surface px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-primary">DreamRealm</Text>
          <TouchableOpacity onPress={signOut} className="rounded-lg border border-border px-3 py-1.5">
            <Text className="text-sm text-text">Sign out</Text>
          </TouchableOpacity>
        </View>
        <Text className="mt-1 text-sm text-text-muted">{user.email}</Text>
        {isProfileLoading ? (
          <Text className="mt-1 text-xs text-text-muted">Loading profile...</Text>
        ) : profile ? (
          <Text className="mt-1 text-xs text-primary">{profile.display_name} — {profile.mode.replace(/_/g, " ")}</Text>
        ) : (
          <TouchableOpacity onPress={() => router.push("/onboarding")}>
            <Text className="mt-1 text-xs text-danger">No profile — complete onboarding</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <Text className="mb-2 text-lg font-bold text-text">Welcome back</Text>
        <Text className="mb-4 text-sm text-text-muted">Pick a module</Text>

        <View className="flex flex-wrap flex-row justify-between">
          {MODULES.map((m) => (
            <TouchableOpacity
              key={m.name}
              onPress={() => {
                if (m.name === "Messages") router.push("/messages");
              }}
              activeOpacity={0.8}
              className="mb-4 w-[48%] rounded-2xl border border-border bg-surface p-4"
            >
              <Text className="mb-1 text-base font-semibold text-text">{m.name}</Text>
              <Text className="text-xs text-text-muted">{m.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
