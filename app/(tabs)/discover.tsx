import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getQueryFn } from "@/lib/query-client";

type TabType = "news" | "events";

function NewsItem({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.newsItem, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={styles.newsItemBadge}>
        <Text style={styles.newsItemBadgeText}>{item.category}</Text>
      </View>
      <Text style={styles.newsItemTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.newsItemContent} numberOfLines={3}>{item.content}</Text>
      <Text style={styles.newsItemDate}>
        {new Date(item.createdAt).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Text>
    </Pressable>
  );
}

function EventItem({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.eventItem, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={styles.eventDateBox}>
        <Text style={styles.eventDateDay}>{new Date(item.date).getDate()}</Text>
        <Text style={styles.eventDateMonth}>
          {new Date(item.date).toLocaleDateString("en-AU", { month: "short" })}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventItemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.eventLocation} numberOfLines={1}>{item.location}</Text>
        </View>
        {!!item.time && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.eventLocation}>{item.time}</Text>
          </View>
        )}
      </View>
      <View style={styles.eventCategoryBadge}>
        <Text style={styles.eventCategoryText}>{item.category}</Text>
      </View>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [tab, setTab] = useState<TabType>("news");

  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ["/api/news"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ["/api/events"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const newsList = (newsData as any[]) || [];
  const eventsList = (eventsData as any[]) || [];
  const isLoading = tab === "news" ? newsLoading : eventsLoading;
  const currentList = tab === "news" ? newsList : eventsList;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tabBtn, tab === "news" && styles.tabBtnActive]}
            onPress={() => setTab("news")}
          >
            <Ionicons
              name="newspaper"
              size={18}
              color={tab === "news" ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.tabText, tab === "news" && styles.tabTextActive]}>News</Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, tab === "events" && styles.tabBtnActive]}
            onPress={() => setTab("events")}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={tab === "events" ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.tabText, tab === "events" && styles.tabTextActive]}>Events</Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={currentList}
          renderItem={({ item }) =>
            tab === "news" ? (
              <NewsItem
                item={item}
                onPress={() => router.push({ pathname: "/news-detail", params: { id: item.id } })}
              />
            ) : (
              <EventItem
                item={item}
                onPress={() => router.push({ pathname: "/event-detail", params: { id: item.id } })}
              />
            )
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => (tab === "news" ? refetchNews() : refetchEvents())}
            />
          }
          scrollEnabled={!!currentList.length}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name={tab === "news" ? "newspaper-outline" : "calendar-outline"}
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.emptyTitle}>
                No {tab === "news" ? "news" : "events"} yet
              </Text>
              <Text style={styles.emptyText}>
                Check back later for updates
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 14,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  tabTextActive: { color: Colors.white },
  listContent: { padding: 20, paddingBottom: 100 },
  newsItem: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  newsItemBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary + "12",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  newsItemBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  newsItemTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  newsItemContent: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  newsItemDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  eventDateBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  eventDateDay: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
    lineHeight: 26,
  },
  eventDateMonth: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
    textTransform: "uppercase",
  },
  eventItemTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  eventLocation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  eventCategoryBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventCategoryText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
