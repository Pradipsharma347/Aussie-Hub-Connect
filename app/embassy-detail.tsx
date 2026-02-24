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
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getQueryFn } from "@/lib/query-client";

function EmbassyCard({ item }: { item: any }) {
  const services = item.services
    ? item.services.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <View style={styles.embassyCard}>
      <View style={styles.embassyHeader}>
        <View style={styles.embassyIcon}>
          <Ionicons name="flag" size={24} color={Colors.danger} />
        </View>
        <Text style={styles.embassyName}>{item.name}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="location" size={18} color={Colors.primary} />
        <Text style={styles.detailText}>{item.address}</Text>
      </View>

      {!!item.phone && (
        <Pressable style={styles.detailRow} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={[styles.detailText, styles.linkText]}>{item.phone}</Text>
        </Pressable>
      )}

      {!!item.email && (
        <Pressable style={styles.detailRow} onPress={() => Linking.openURL(`mailto:${item.email}`)}>
          <Ionicons name="mail" size={18} color={Colors.primary} />
          <Text style={[styles.detailText, styles.linkText]}>{item.email}</Text>
        </Pressable>
      )}

      {!!item.website && (
        <Pressable style={styles.detailRow} onPress={() => Linking.openURL(item.website)}>
          <Ionicons name="globe" size={18} color={Colors.primary} />
          <Text style={[styles.detailText, styles.linkText]}>{item.website}</Text>
        </Pressable>
      )}

      {!!item.openingHours && (
        <View style={styles.detailRow}>
          <Ionicons name="time" size={18} color={Colors.primary} />
          <Text style={styles.detailText}>{item.openingHours}</Text>
        </View>
      )}

      {services.length > 0 && (
        <View style={styles.servicesSection}>
          <Text style={styles.servicesTitle}>Services</Text>
          <View style={styles.servicesList}>
            {services.map((s: string, i: number) => (
              <View key={i} style={styles.serviceChip}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.serviceText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!!item.mapUrl && (
        <Pressable
          style={({ pressed }) => [styles.mapBtn, pressed && { opacity: 0.9 }]}
          onPress={() => Linking.openURL(item.mapUrl)}
        >
          <Ionicons name="map" size={18} color={Colors.white} />
          <Text style={styles.mapBtnText}>Open in Maps</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function EmbassyDetailScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading } = useQuery({
    queryKey: ["/api/embassy"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const embassyList = (data as any[]) || [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Australian Embassy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : embassyList.length > 0 ? (
          embassyList.map((item: any) => <EmbassyCard key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No embassy info available</Text>
            <Text style={styles.emptyText}>
              Embassy details will be updated by the admin
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
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
  content: { padding: 20, paddingBottom: 40 },
  embassyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  embassyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  embassyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.danger + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  embassyName: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 22,
  },
  linkText: {
    color: Colors.primary,
  },
  servicesSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  servicesTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 12,
  },
  servicesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.success + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  serviceText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  mapBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
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
