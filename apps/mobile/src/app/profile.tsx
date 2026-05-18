/**
 * Mobile Profile View Screen
 *
 * Displays the current authenticated user's profile and user metadata.
 * Provides a button to navigate to the profile edit screen.
 */

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, profile, isProfileLoading, signOut } = useAuth();
  const router = useRouter();

  if (isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-text-muted">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-text-muted">Please sign in to view your profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-6 py-8">
      <View className="mb-6 items-center">
        <Text className="text-2xl font-bold text-text">Your Profile</Text>
      </View>

      {/* Account Card */}
      <View className="mb-4 rounded-2xl border border-border bg-surface p-5">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Account
        </Text>
        <View className="space-y-3">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role} />
          <InfoRow label="Trust Level" value={user.trust_bucket} />
          <InfoRow label="Verified" value={user.email_confirmed_at ? "Yes" : "No"} />
        </View>
      </View>

      {/* Profile Card */}
      {profile ? (
        <View className="mb-4 rounded-2xl border border-border bg-surface p-5">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Profile
          </Text>
          <View className="space-y-3">
            <InfoRow label="Display Name" value={profile.display_name} />
            <InfoRow label="Mode" value={profile.mode.replace(/_/g, " ")} />
            <InfoRow label="Visibility" value={profile.visibility} />
            <InfoRow label="Trust Score" value={`${profile.trust_score}/100`} />
            {profile.bio ? (
              <View>
                <Text className="text-xs text-text-muted">Bio</Text>
                <Text className="mt-1 text-sm text-text">{profile.bio}</Text>
              </View>
            ) : null}
            {(profile.city || profile.country) && (
              <InfoRow
                label="Location"
                value={`${profile.city ?? ""}${profile.city && profile.country ? ", " : ""}${profile.country ?? ""}`}
              />
            )}
            {profile.birth_date && <InfoRow label="Birth Date" value={profile.birth_date} />}
            {profile.looking_for && profile.looking_for.length > 0 && (
              <View>
                <Text className="text-xs text-text-muted">Looking for</Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {profile.looking_for.map((m) => (
                    <Text
                      key={m}
                      className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary"
                    >
                      {m.replace(/_/g, " ")}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/profile/edit")}
            activeOpacity={0.8}
            className="mt-6 w-full items-center rounded-lg bg-primary px-4 py-3"
          >
            <Text className="font-semibold text-white">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mb-4 rounded-2xl border border-border bg-surface p-5 text-center">
          <Text className="text-text-muted">No profile found.</Text>
          <TouchableOpacity
            onPress={() => router.push("/onboarding")}
            activeOpacity={0.8}
            className="mt-3"
          >
            <Text className="text-sm text-primary">Create your profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={signOut}
        activeOpacity={0.8}
        className="w-full items-center rounded-lg border border-danger px-4 py-3"
      >
        <Text className="font-semibold text-danger">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-text-muted">{label}</Text>
      <Text className="text-sm text-text">{value}</Text>
    </View>
  );
}
