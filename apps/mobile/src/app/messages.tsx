/**
 * Mobile Conversation List Screen
 *
 * Displays all conversations the current user is a member of.
 * Uses Supabase Realtime to auto-refresh on conversation changes.
 * TODO: Fetch last message content/sender for richer previews.
 */

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthProvider";
import {
  getMyConversations,
  subscribeToConversations,
} from "@dreamrealm/api-client";
import type { ConversationWithLastMessage } from "@dreamrealm/api-client";
import { useRouter } from "expo-router";

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function MessagesScreen() {
  const { client } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyConversations(client);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    load();
    const unsubscribe = subscribeToConversations(client, () => {
      load();
    });
    return unsubscribe;
  }, [client, load]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#A855F7" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-danger">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-border bg-surface px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-text">Messages</Text>
        </View>
      </View>

      {conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-muted">No conversations yet.</Text>
          <Text className="mt-1 text-sm text-text-muted">Start matching to chat.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/messages/${item.id}`)}
              activeOpacity={0.8}
              className="flex-row items-center justify-between border-b border-border px-4 py-4"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-text">
                    {item.title ?? (item.type === "direct" ? "Direct Message" : "Group Chat")}
                  </Text>
                  {item.is_encrypted && (
                    <Text className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      Encrypted
                    </Text>
                  )}
                </View>
                <Text className="mt-1 text-xs text-text-muted">
                  {item.type === "direct" ? "Private conversation" : `${item.type} chat`}
                </Text>
              </View>
              <View className="ml-4 items-end">
                {item.last_message_at && (
                  <Text className="text-xs text-text-muted">
                    {formatTimeAgo(item.last_message_at)}
                  </Text>
                )}
                <View
                  className={`mt-1 h-2 w-2 rounded-full ${
                    item.last_message_at ? "bg-primary" : "bg-transparent"
                  }`}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
