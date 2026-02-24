import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getQueryFn } from "@/lib/query-client";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: item, isLoading } = useQuery({
    queryKey: [`/api/events/${id}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!id,
  });

  const event = item as any;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Event</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eventHeader}>
          <View style={styles.dateCard}>
            <Text style={styles.dateDay}>{new Date(event.date).getDate()}</Text>
            <Text style={styles.dateMonth}>
              {new Date(event.date).toLocaleDateString("en-AU", { month: "long" })}
            </Text>
            <Text style={styles.dateYear}>
              {new Date(event.date).getFullYear()}
            </Text>
          </View>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(event.date).toLocaleDateString("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
          {!!event.time && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{event.description}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  content: { padding: 24, paddingBottom: 40 },
  eventHeader: { alignItems: "center", marginBottom: 20 },
  dateCard: {
    backgroundColor: Colors.accent + "15",
    borderRadius: 18,
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.accent + "30",
  },
  dateDay: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
    lineHeight: 48,
  },
  dateMonth: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
  },
  dateYear: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary + "12",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    lineHeight: 32,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 24,
  },
  errorText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
});
