/**
 * Expo React Native app for DreamRealm.
 *
 * Uses Expo SDK 52 with expo-router for file-based routing.
 * NativeWind provides Tailwind-style styling for native components.
 *
 * Entry point is in app/index.tsx (Expo Router convention).
 */

import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

registerRootComponent(ExpoRoot);
