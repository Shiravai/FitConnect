// App.js — root of the FitConnect mobile app.
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";

import { AuthProvider } from "./src/context/AuthContext";
import { ChatProvider } from "./src/context/ChatContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme";

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.card, text: colors.text, border: colors.border, primary: colors.primary },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChatProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </ChatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
