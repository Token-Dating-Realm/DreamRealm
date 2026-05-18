/**
 * Mobile Login Screen
 *
 * Email/password authentication using the mobile AuthProvider.
 * Includes OAuth buttons for Google and Apple.
 * TODO: Add device fingerprinting after sign-in.
 */

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { signIn, signInWithOAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsPending(true);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-12">
      <View className="mb-8 items-center">
        <Text className="text-3xl font-bold text-primary">DreamRealm</Text>
        <Text className="mt-2 text-text-muted">Welcome back</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
            placeholderTextColor="#94A3B8"
            placeholder="you@example.com"
          />
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
            placeholderTextColor="#94A3B8"
            placeholder="Enter your password"
          />
        </View>

        {error && <Text className="text-sm text-danger">{error}</Text>}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.8}
          className="w-full items-center rounded-lg bg-primary px-4 py-3"
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-white">Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="mt-6">
        <View className="mb-4 items-center">
          <Text className="text-xs text-text-muted">Or continue with</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => signInWithOAuth("google")}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-lg border border-border bg-surface-light px-3 py-3"
          >
            <Text className="text-sm text-text">Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => signInWithOAuth("apple")}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-lg border border-border bg-surface-light px-3 py-3"
          >
            <Text className="text-sm text-text">Apple</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/signup")}
        className="mt-6 items-center"
      >
        <Text className="text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Text className="text-primary">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
