import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { getQueryFn, queryClient } from "@/lib/query-client";

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      )}
    </View>
  );
}

function QuickActionCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function NewsCard({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.newsCard, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={styles.newsCardBadge}>
        <Text style={styles.newsCardBadgeText}>{item.category}</Text>
      </View>
      <Text style={styles.newsCardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.newsCardContent} numberOfLines={2}>
        {item.content}
      </Text>
    </Pressable>
  );
}

function JobCard({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.jobCard, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.jobCompanyIcon}>
          <Ionicons name="business" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobCardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.jobCardCompany} numberOfLines={1}>
            {item.company}
          </Text>
        </View>
      </View>
      <View style={styles.jobCardFooter}>
        <View style={styles.jobTag}>
          <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.jobTagText}>{item.location}</Text>
        </View>
        <View style={styles.jobTag}>
          <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.jobTagText}>{item.type}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: newsData, isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ["/api/news"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: eventsData, refetch: refetchEvents } = useQuery({
    queryKey: ["/api/events"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const onRefresh = () => {
    refetchNews();
    refetchJobs();
    refetchEvents();
  };

  const newsList = (newsData as any[]) || [];
  const jobsList = (jobsData as any[]) || [];
  const eventsList = (eventsData as any[]) || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary, Colors.primaryLight]}
          style={[styles.heroSection, { paddingTop: topPadding + 16 }]}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroGreeting}>
              {user ? `Hello, ${user.fullName || user.username}` : "Welcome to"}
            </Text>
            <Text style={styles.heroTitle}>Kaam App</Text>
            <Text style={styles.heroSubtitle}>
              Your gateway to jobs, rooms & community in Australia
            </Text>
          </View>
          {!user && (
            <Pressable
              style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.9 }]}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.heroBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.primaryDark} />
            </Pressable>
          )}
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.quickActions}>
            <QuickActionCard
              icon="briefcase-outline"
              label="Jobs"
              color={Colors.primary}
              onPress={() => router.push("/(tabs)/jobs")}
            />
            <QuickActionCard
              icon="business-outline"
              label="Rooms"
              color={Colors.info}
              onPress={() => router.push("/(tabs)/rooms")}
            />
            <QuickActionCard
              icon="newspaper-outline"
              label="News"
              color={Colors.accent}
              onPress={() => router.push("/(tabs)/discover")}
            />
            <QuickActionCard
              icon="flag-outline"
              label="Embassy"
              color={Colors.danger}
              onPress={() => router.push("/embassy-detail")}
            />
          </View>

          {newsList.length > 0 && (
            <>
              <SectionHeader
                title="Latest News"
                onSeeAll={() => router.push("/(tabs)/discover")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {newsList.slice(0, 5).map((item: any) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onPress={() =>
                      router.push({ pathname: "/news-detail", params: { id: item.id } })
                    }
                  />
                ))}
              </ScrollView>
            </>
          )}

          {jobsList.length > 0 && (
            <>
              <SectionHeader
                title="Recent Jobs"
                onSeeAll={() => router.push("/(tabs)/jobs")}
              />
              {jobsList.slice(0, 3).map((item: any) => (
                <JobCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push({ pathname: "/job-detail", params: { id: item.id } })
                  }
                />
              ))}
            </>
          )}

          {eventsList.length > 0 && (
            <>
              <SectionHeader
                title="Upcoming Events"
                onSeeAll={() => router.push("/(tabs)/discover")}
              />
              {eventsList.slice(0, 2).map((item: any) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.eventCard, pressed && { opacity: 0.9 }]}
                  onPress={() =>
                    router.push({ pathname: "/event-detail", params: { id: item.id } })
                  }
                >
                  <View style={styles.eventDateBox}>
                    <Text style={styles.eventDateDay}>
                      {new Date(item.date).getDate()}
                    </Text>
                    <Text style={styles.eventDateMonth}>
                      {new Date(item.date).toLocaleDateString("en-AU", { month: "short" })}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                </Pressable>
              ))}
            </>
          )}

          {newsLoading && jobsLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading content...</Text>
            </View>
          )}

          {!newsLoading && !jobsLoading && newsList.length === 0 && jobsList.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="information-circle-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No content yet</Text>
              <Text style={styles.emptyText}>
                Content will appear here once the admin publishes news, jobs, and events.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  heroContent: {
    marginBottom: 20,
  },
  heroGreeting: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  heroBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primaryDark,
  },
  content: {
    padding: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    marginTop: -20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAction: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  horizontalList: {
    paddingRight: 20,
    gap: 14,
    marginBottom: 16,
  },
  newsCard: {
    width: 260,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  newsCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary + "12",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  newsCardBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  newsCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  newsCardContent: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  jobCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  jobCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  jobCompanyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  jobCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  jobCardCompany: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  jobCardFooter: {
    flexDirection: "row",
    gap: 12,
  },
  jobTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  jobTagText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  eventCard: {
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
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  eventDateDay: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    lineHeight: 24,
  },
  eventDateMonth: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
    textTransform: "uppercase",
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  eventLocation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  emptyContainer: {
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
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
