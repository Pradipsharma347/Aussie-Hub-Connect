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

const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Casual"];

function JobListItem({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.jobItem, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={styles.jobIcon}>
        <Ionicons name="briefcase" size={22} color={Colors.primary} />
      </View>
      <View style={styles.jobInfo}>
        <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.jobCompany} numberOfLines={1}>{item.company}</Text>
        <View style={styles.jobMeta}>
          <View style={styles.jobMetaItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.jobMetaText}>{item.location}</Text>
          </View>
          <View style={styles.jobMetaItem}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.jobMetaText}>{item.type}</Text>
          </View>
          {!!item.salary && (
            <View style={styles.jobMetaItem}>
              <Ionicons name="cash-outline" size={13} color={Colors.success} />
              <Text style={[styles.jobMetaText, { color: Colors.success }]}>{item.salary}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
    </Pressable>
  );
}

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const jobsList = (data as any[]) || [];

  const filtered = useMemo(() => {
    return jobsList.filter((j: any) => {
      const matchSearch =
        !search ||
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedType === "All" || j.type === selectedType;
      return matchSearch && matchType;
    });
  }, [jobsList, search, selectedType]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
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
          data={JOB_TYPES}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                selectedType === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === item && styles.filterChipTextActive,
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
            <JobListItem
              item={item}
              onPress={() => router.push({ pathname: "/job-detail", params: { id: item.id } })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} />}
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptyText}>
                {search || selectedType !== "All"
                  ? "Try adjusting your search or filters"
                  : "Job listings will appear here"}
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
  jobItem: {
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
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  jobCompany: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  jobMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    flexWrap: "wrap",
  },
  jobMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
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
