/**
 * Mobile Signup Screen
 *
 * Email/password registration using the mobile AuthProvider.
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

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setIsPending(true);
    try {
      await signUp(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-12">
      <View className="mb-8 items-center">
        <Text className="text-3xl font-bold text-primary">DreamRealm</Text>
        <Text className="mt-2 text-text-muted">Join the community</Text>
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
            placeholder="Min 8 characters"
          />
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">Confirm Password</Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
            placeholderTextColor="#94A3B8"
            placeholder="Repeat password"
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
            <Text className="font-semibold text-white">Create Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
