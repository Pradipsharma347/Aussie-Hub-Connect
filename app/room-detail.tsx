import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getQueryFn } from "@/lib/query-client";

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: item, isLoading } = useQuery({
    queryKey: [`/api/rooms/${id}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!id,
  });

  const room = item as any;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Room not found</Text>
      </View>
    );
  }

  const statusColor =
    room.availability === "Available"
      ? Colors.success
      : room.availability === "Pending"
      ? Colors.accent
      : Colors.danger;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Room Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.roomHeader}>
          <View style={styles.roomIcon}>
            <Ionicons name="bed" size={32} color={Colors.info} />
          </View>
          <Text style={styles.title}>{room.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{room.availability}</Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Weekly Rent</Text>
          <Text style={styles.priceValue}>${room.price}</Text>
          <Text style={styles.priceUnit}>per week</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{room.location}</Text>
            </View>
          </View>
          {!!room.contactPhone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>{room.contactPhone}</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{room.description}</Text>

        {!!room.contactPhone && (
          <Pressable
            style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.9 }]}
            onPress={() => Linking.openURL(`tel:${room.contactPhone}`)}
          >
            <Ionicons name="call" size={20} color={Colors.white} />
            <Text style={styles.callBtnText}>Call Now</Text>
          </Pressable>
        )}
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
  roomHeader: { alignItems: "center", marginBottom: 24 },
  roomIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.info + "12",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  priceCard: {
    backgroundColor: Colors.primary + "08",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    marginVertical: 4,
  },
  priceUnit: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
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
    marginBottom: 24,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  callBtnText: { color: Colors.white, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  errorText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
});
