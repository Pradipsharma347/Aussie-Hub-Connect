import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
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

const AVAILABILITY = ["All", "Available", "Taken", "Pending"];

function RoomListItem({ item, onPress }: { item: any; onPress: () => void }) {
  const statusColor =
    item.availability === "Available"
      ? Colors.success
      : item.availability === "Pending"
      ? Colors.accent
      : Colors.danger;

  return (
    <Pressable
      style={({ pressed }) => [styles.roomItem, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={styles.roomHeader}>
        <View style={styles.roomIcon}>
          <Ionicons name="bed" size={22} color={Colors.info} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.roomLocation} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{item.availability}</Text>
        </View>
      </View>
      <View style={styles.roomFooter}>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${item.price}/wk</Text>
        </View>
        <Text style={styles.roomDesc} numberOfLines={1}>{item.description}</Text>
      </View>
    </Pressable>
  );
}

export default function RoomsScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [search, setSearch] = useState("");
  const [selectedAvail, setSelectedAvail] = useState("All");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/rooms"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const roomsList = (data as any[]) || [];

  const filtered = useMemo(() => {
    return roomsList.filter((r: any) => {
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase());
      const matchAvail = selectedAvail === "All" || r.availability === selectedAvail;
      return matchSearch && matchAvail;
    });
  }, [roomsList, search, selectedAvail]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={styles.headerTitle}>Rooms</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rooms..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </Pressable>
          )}
        </View>
        <FlatList
          horizontal
          data={AVAILABILITY}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                selectedAvail === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedAvail(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedAvail === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <RoomListItem
              item={item}
              onPress={() => router.push({ pathname: "/room-detail", params: { id: item.id } })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} />}
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No rooms found</Text>
              <Text style={styles.emptyText}>
                {search || selectedAvail !== "All"
                  ? "Try adjusting your search or filters"
                  : "Room listings will appear here"}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  filterList: { gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  filterChipTextActive: { color: Colors.white },
  listContent: { padding: 20, paddingBottom: 100 },
  roomItem: {
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
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.info + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  roomTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  roomLocation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  roomFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceTag: {
    backgroundColor: Colors.success + "15",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.success,
  },
  roomDesc: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
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
