import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getConversationMessages,
  sendMessage,
  subscribeToMessages,
  updateLastRead,
} from "@dreamrealm/api-client";
import type { Message } from "@dreamrealm/types";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await getConversationMessages(client, id, 50);
      setMessages(data);
    } catch {
      // TODO: handle error
    } finally {
      setIsLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    loadMessages();
    updateLastRead(client, id).catch(() => {});

    const unsubscribe = subscribeToMessages(client, id, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [client, id, loadMessages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(client, {
        conversation_id: id,
        type: "text",
        content: input.trim(),
      });
      setInput("");
    } catch {
      // TODO: handle error
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_profile_id === user?.id;
    return (
      <View className={`mb-2 ${isMe ? "items-end" : "items-start"}`}>
        <View className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? "bg-primary" : "bg-surface-light"}`}>
          <Text className={`text-sm ${isMe ? "text-white" : "text-text"}`}>{item.content}</Text>
          <Text className={`mt-1 text-[10px] ${isMe ? "text-white/60" : "text-text-muted"}`}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="border-b border-border bg-surface px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-sm text-text-muted">← Back</Text>
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-text">Chat</Text>
          <Text className="text-sm text-text-muted">{messages.length}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        className="flex-1 px-4 py-2"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View className="border-t border-border bg-surface px-4 py-2">
        <View className="flex-row items-center gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-border bg-surface-light px-4 py-2 text-text"
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isSending || !input.trim()}
            activeOpacity={0.8}
            className={`rounded-full bg-primary px-4 py-2 ${(!input.trim() || isSending) ? "opacity-50" : ""}`}
          >
            <Text className="text-sm font-semibold text-white">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
