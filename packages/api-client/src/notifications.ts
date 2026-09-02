/**
 * Notifications API Helpers
 *
 * Reusable fetch/update functions for the `notifications` table
 * (011_notifications.sql). Accept a typed Supabase client so callers
 * bring their own instance.
 */

import type { TypedSupabaseClient } from "./index";
import type { Notification } from "@dreamrealm/types";

export async function getMyNotifications(
  client: TypedSupabaseClient,
  limit = 50
): Promise<Notification[]> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await client
    .from("notifications")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function markAllNotificationsRead(client: TypedSupabaseClient): Promise<void> {
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { error } = await (client.from("notifications") as any)
    .update({ is_read: true })
    .eq("user_id", userData.user.id)
    .eq("is_read", false);

  if (error) throw error;
}

export async function markNotificationRead(
  client: TypedSupabaseClient,
  notificationId: string
): Promise<void> {
  const { error } = await (client.from("notifications") as any)
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}
