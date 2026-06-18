// src/navigation/RootNavigator.js — auth stack when logged out, tabs + detail stack when logged in.
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { colors } from "../theme";
import { Loading } from "../components/ui";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import FeedScreen from "../screens/FeedScreen";
import GroupsScreen from "../screens/GroupsScreen";
import GroupDetailScreen from "../screens/GroupDetailScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import StatsScreen from "../screens/StatsScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AdminScreen from "../screens/AdminScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon = (emoji) => ({ color }) => <Text style={{ fontSize: 20, opacity: color === colors.primary ? 1 : 0.6 }}>{emoji}</Text>;

function MainTabs() {
  const { totalUnread } = useChat();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 60, paddingBottom: 6, paddingTop: 6 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: "feed", tabBarIcon: tabIcon("🏠") }} />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ tabBarLabel: "groups", tabBarIcon: tabIcon("👥") }} />
      <Tab.Screen name="Create" component={CreatePostScreen} options={{ tabBarLabel: "post", tabBarIcon: tabIcon("➕") }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: "stats", tabBarIcon: tabIcon("📊") }} />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ tabBarLabel: "chat", tabBarIcon: tabIcon("💬"), tabBarBadge: totalUnread > 0 ? totalUnread : undefined }}
      />
      <Tab.Screen name="Me" component={ProfileScreen} options={{ tabBarLabel: "me", tabBarIcon: tabIcon("👤") }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="loading fitconnect…" />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: "group" }} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={({ route }) => ({ title: route.params?.name || "chat" })} />
          <Stack.Screen name="UserProfile" component={ProfileScreen} options={{ title: "profile" }} />
          <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "admin panel" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
