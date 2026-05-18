/**
 * Mobile Onboarding / Profile Creation Wizard
 *
 * Multi-step form for new users to configure their profile.
 * Steps: mode, basics, location, preferences, review.
 * Uses NativeWind for styling and Zod-compatible validation logic.
 * On completion, creates the profile via createMyProfile and redirects to home.
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
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthProvider";
import { createMyProfile } from "@dreamrealm/api-client";
import { profileModeSchema, visibilitySchema } from "@dreamrealm/types";
import type { ProfileMode, Visibility } from "@dreamrealm/types";

const STEPS = ["mode", "basics", "location", "preferences", "review"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingScreen() {
  const { client, refreshProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("mode");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ProfileMode | "">("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [lookingFor, setLookingFor] = useState<ProfileMode[]>([]);
  const [visibility, setVisibility] = useState<Visibility>("public");

  const profileModes = profileModeSchema.options;
  const visibilities = visibilitySchema.options;

  const toggleLookingFor = (m: ProfileMode) => {
    setLookingFor((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].slice(0, 5)
    );
  };

  const canProceed = () => {
    switch (step) {
      case "mode":
        return !!mode;
      case "basics":
        return displayName.trim().length >= 1 && displayName.trim().length <= 100;
      case "location":
      case "preferences":
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!mode) return;
    setIsPending(true);
    setError(null);
    try {
      await createMyProfile(client, {
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
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsPending(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <ScrollView className="flex-1 bg-background px-6 py-8">
      <View className="mb-6 items-center">
        <Text className="text-2xl font-bold text-primary">Welcome to DreamRealm</Text>
        <Text className="mt-1 text-sm text-text-muted">Step {stepIndex + 1} of {STEPS.length}</Text>
      </View>

      {/* Progress dots */}
      <View className="mb-6 flex-row justify-center gap-2">
        {STEPS.map((_, i) => (
          <View
            key={i}
            className={`h-2 w-2 rounded-full ${
              i <= stepIndex ? "bg-primary" : "bg-surface-light"
            }`}
          />
        ))}
      </View>

      {error && (
        <View className="mb-4 rounded-lg bg-danger/10 p-3">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      )}

      {step === "mode" && (
        <View className="space-y-4">
          <Text className="text-text-muted">Choose your profile type</Text>
          <View className="flex-row flex-wrap gap-2">
            {profileModes.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                activeOpacity={0.8}
                className={`rounded-lg border px-4 py-3 ${
                  mode === m
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-light"
                }`}
              >
                <Text
                  className={`text-sm ${
                    mode === m ? "text-primary" : "text-text"
                  }`}
                >
                  {m.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === "basics" && (
        <View className="space-y-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-text-muted">
              Display Name <Text className="text-danger">*</Text>
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
              placeholderTextColor="#94A3B8"
              placeholder="Your name on DreamRealm"
            />
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
              placeholder="Tell others about yourself"
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
        </View>
      )}

      {step === "location" && (
        <View className="space-y-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-text-muted">City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
              placeholderTextColor="#94A3B8"
              placeholder="Your city"
            />
          </View>
          <View>
            <Text className="mb-1 text-sm font-medium text-text-muted">Country</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-text"
              placeholderTextColor="#94A3B8"
              placeholder="Your country"
            />
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
                placeholder="e.g. 40.7128"
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
                placeholder="e.g. -74.0060"
              />
            </View>
          </View>
        </View>
      )}

      {step === "preferences" && (
        <View className="space-y-4">
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
                    className={`text-sm ${
                      visibility === v ? "text-primary" : "text-text"
                    }`}
                  >
                    {v[0].toUpperCase() + v.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {step === "review" && (
        <View className="space-y-3">
          <ReviewItem label="Mode" value={mode.replace(/_/g, " ")} />
          <ReviewItem label="Name" value={displayName} />
          <ReviewItem label="Location" value={`${city || "—"}, ${country || "—"}`} />
          <ReviewItem
            label="Looking for"
            value={
              lookingFor.length > 0
                ? lookingFor.map((m) => m.replace(/_/g, " ")).join(", ")
                : "—"
            }
          />
          <ReviewItem
            label="Visibility"
            value={visibility[0].toUpperCase() + visibility.slice(1)}
          />
        </View>
      )}

      <View className="mt-8 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
          }}
          disabled={stepIndex === 0}
          activeOpacity={0.8}
          className={`rounded-lg border border-border px-4 py-3 ${
            stepIndex === 0 ? "opacity-40" : ""
          }`}
        >
          <Text className="text-sm text-text">Back</Text>
        </TouchableOpacity>

        {step === "review" ? (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.8}
            className="rounded-lg bg-primary px-6 py-3"
          >
            {isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="font-semibold text-white">Finish</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
            }}
            disabled={!canProceed()}
            activeOpacity={0.8}
            className={`rounded-lg bg-primary px-6 py-3 ${
              !canProceed() ? "opacity-50" : ""
            }`}
          >
            <Text className="font-semibold text-white">Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-lg bg-surface-light p-4">
      <Text className="text-xs text-text-muted">{label}</Text>
      <Text className="mt-1 text-sm font-semibold text-text">{value}</Text>
    </View>
  );
}
