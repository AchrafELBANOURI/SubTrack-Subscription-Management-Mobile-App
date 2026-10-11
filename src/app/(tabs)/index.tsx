import { Link } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { SafeScreen } from "../../../components/SafeScreen";
import "../../../global.css";

export default function Index() {
  return (
    <SafeScreen className="screen-container">
      <Text className="text-xl font-sans-extrabold text-blue-500">Home</Text>

      <Link
        href="/onboarding"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        On Boarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Sign In
      </Link>

      <Link
        href="/subscriptions/spotify"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Spotify Subscription
      </Link>

      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Claude Subscription
      </Link>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
