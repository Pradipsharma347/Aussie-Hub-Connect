import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

function MenuRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? Colors.danger : Colors.primary}
      />
      <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>
        {label}
      </Text>
      {!!value && <Text style={styles.menuValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      logout();
      return;
    }
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.notLoggedIn}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color={Colors.textLight} />
          </View>
          <Text style={styles.notLoggedInTitle}>Sign in to your account</Text>
          <Text style={styles.notLoggedInText}>
            Create a profile to save jobs, find rooms, and connect with the community
          </Text>
          <Pressable
            style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.9 }]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const initials = (user.fullName || user.username)
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { paddingTop: topPadding + 20 }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{user.fullName || user.username}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          {!!user.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.locationText}>{user.city}</Text>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="person-outline"
              label="Edit Profile"
              onPress={() => router.push("/edit-profile")}
            />
            <MenuRow
              icon="briefcase-outline"
              label="My Bookmarks"
              value="Coming soon"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Information</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="flag-outline"
              label="Embassy Details"
              onPress={() => router.push("/embassy-detail")}
            />
            <MenuRow
              icon="information-circle-outline"
              label="About Kaam App"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuRow
              icon="log-out-outline"
              label="Logout"
              danger
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notLoggedIn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  notLoggedInTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  notLoggedInText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  signInBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  createAccountText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
    marginTop: 8,
  },
  profileHeader: {
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  menuSection: {
    padding: 20,
    paddingBottom: 0,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  menuValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
});
