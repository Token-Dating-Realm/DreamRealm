/**
 * Mobile Auth Context
 *
 * Provides Supabase client and session state for the mobile app.
 * Subscribes to auth state changes for multi-tab/session sync.
 * Fetches full `public.users` row and `public.profiles` after sign-in.
 * Supports OAuth sign-in (Google, Apple).
 * TODO: Implement expo-secure-store integration for session persistence.
 * TODO: Add device fingerprinting on sign-in.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient, getMyProfile } from "@dreamrealm/api-client";
import { getDeviceFingerprint } from "@dreamrealm/api-client";
import type { User, Profile } from "@dreamrealm/types";
import type { TypedSupabaseClient } from "@dreamrealm/api-client";

interface AuthContextValue {
  client: TypedSupabaseClient;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: "google" | "apple") => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState<TypedSupabaseClient>(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchFullUser = useCallback(
    async (sessionUser: { id: string; email?: string | null; created_at: string }) => {
      const { data, error } = await client
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (error || !data) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? "",
          role: "user",
          email_confirmed_at: null,
          created_at: sessionUser.created_at,
          updated_at: sessionUser.created_at,
          last_sign_in_at: null,
          raw_user_meta_data: null,
          device_fingerprint: null,
          geo_region: null,
          trust_bucket: "new",
        });
        return;
      }

      setUser(data as User);

      setIsProfileLoading(true);
      try {
        const p = await getMyProfile(client);
        setProfile(p);
      } catch {
        setProfile(null);
      } finally {
        setIsProfileLoading(false);
      }
    },
    [client]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession();

        if (sessionError) {
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          await fetchFullUser(session.user as { id: string; email?: string | null; created_at: string });
        }
      } catch {
        // TODO: Mobile error logging (Sentry)
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchFullUser(session.user as { id: string; email?: string | null; created_at: string });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, fetchFullUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error, data } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const fingerprint = await getDeviceFingerprint();
      await client
        .from("users")
        .update({ device_fingerprint: fingerprint })
        .eq("id", data.user.id);

      await fetchFullUser(data.user as { id: string; email?: string | null; created_at: string });
    },
    [client, fetchFullUser]
  );

  const signInWithOAuth = useCallback(
    async (provider: "google" | "apple") => {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "com.dreamrealm.app://auth/callback",
        },
      });
      if (error) throw error;
    },
    [client]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error, data } = await client.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        await fetchFullUser(data.user as { id: string; email?: string | null; created_at: string });
      }
    },
    [client, fetchFullUser]
  );

  const signOut = useCallback(async () => {
    await client.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [client]);

  const refreshProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const p = await getMyProfile(client);
      setProfile(p);
    } catch {
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, [client]);

  return (
    <AuthContext.Provider
      value={{
        client,
        user,
        profile,
        isLoading,
        isProfileLoading,
        signIn,
        signInWithOAuth,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
