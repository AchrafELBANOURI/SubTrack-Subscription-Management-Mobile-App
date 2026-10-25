import { useEffect } from "react";

import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
    throw new Error("Add your Clerk Publishable Key to the .env file");
}

function RootLayoutComponent() {
    const { isLoaded: authLoaded } = useAuth();

    const [fontsLoaded, error] = useFonts({
        "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
        "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
        "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    });

    useEffect(() => {
        if ((fontsLoaded || error) && authLoaded) {
            SplashScreen.hide();
        }
    }, [fontsLoaded, error, authLoaded]);

    if ((!fontsLoaded && !error) || !authLoaded) {
        return null;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <RootLayoutComponent />
        </ClerkProvider>
    );
}
