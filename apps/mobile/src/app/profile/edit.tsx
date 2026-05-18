/**
 * Mobile Profile Edit Screen
 *
 * Form to update profile fields via updateMyProfile.
 * Uses Zod validation through the shared api-client helper.
 * Navigates back to /profile on success.
 */

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { updateMyProfile } from "@dreamrealm/api-client";
import { profileModeSchema, visibilitySchema } from "@dreamrealm/types";
import type { ProfileMode, Visibility } from "@dreamrealm/types";
import { useRouter } from "expo-router";

export default function EditProfileScreen() {
  const { client, profile, isProfileLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<ProfileMode>(profile?.mode ?? "single_male");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [latitude, setLatitude] = useState(profile?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(profile?.longitude?.toString() ?? "");
  const [lookingFor, setLookingFor] = useState<ProfileMode[]>(profile?.looking_for ?? []);
  const [visibility, setVisibility] = useState<Visibility>(profile?.visibility ?? "public");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileModes = profileModeSchema.options;
  const visibilities = visibilitySchema.options;

  const toggleLookingFor = (m: ProfileMode) => {
    setLookingFor((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].slice(0, 5)
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setIsPending(true);
    try {
      await updateMyProfile(client, {
        mode,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        birth_date: birthDate || null,
        city: city.trim() || null,
        country: country.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        looking_for: lookingFor.length > 0 ? lookingFor : null,
        visibility,
      });
      await refreshProfile();
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsPending(false);
    }
  };

  if (isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-text-muted">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-text-muted">No profile found. Create one first.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-6 py-8">
      <View className="mb-6 items-center">
        <Text className="text-2xl font-bold text-text">Edit Profile</Text>
      </View>

      {error && (
        <View className="mb-4 rounded-lg bg-danger/10 p-3">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      )}

      <View className="space-y-5">
        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">
            Display Name <Text className="text-danger">*</Text>
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">Profile Mode</Text>
          <View className="flex-row flex-wrap gap-2">
            {profileModes.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                activeOpacity={0.8}
                className={`rounded-lg border px-4 py-2 ${
                  mode === m
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-light"
                }`}
              >
                <Text className={`text-sm ${mode === m ? "text-primary" : "text-text"}`}>
                  {m.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">Birth Date</Text>
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
            placeholderTextColor="#94A3B8"
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-1 text-sm font-medium text-text-muted">City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-sm font-medium text-text-muted">Country</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-1 text-sm font-medium text-text-muted">Latitude</Text>
            <TextInput
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
              className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-sm font-medium text-text-muted">Longitude</Text>
            <TextInput
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
              className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-text-muted">
            I&apos;m looking for (max 5)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {profileModes.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => toggleLookingFor(m)}
                activeOpacity={0.8}
                className={`rounded-full border px-3 py-1 ${
                  lookingFor.includes(m)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-light"
                }`}
              >
                <Text
                  className={`text-xs ${
                    lookingFor.includes(m) ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {m.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-text-muted">Visibility</Text>
          <View className="flex-row flex-wrap gap-2">
            {visibilities.map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setVisibility(v)}
                activeOpacity={0.8}
                className={`rounded-lg border px-4 py-2 ${
                  visibility === v
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-light"
                }`}
              >
                <Text
                  className={`text-sm ${visibility === v ? "text-primary" : "text-text"}`}
                >
                  {v[0].toUpperCase() + v.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row gap-3 pt-4">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-lg bg-primary px-4 py-3"
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="font-semibold text-white">Save Changes</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-lg border border-border px-4 py-3"
          >
            <Text className="text-text">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
