import { useEffect, useRef } from "react";

import { SplashScreen, Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";

import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider, usePostHog } from "posthog-react-native";

import AppToast from "../../components/AppToast";
import { posthog } from "../../lib/posthog";

void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
        },
    },
});

if (!publishableKey) {
    throw new Error("Add your Clerk Publishable Key to the .env file");
}

function RouteChangeTracker() {
    const pathname = usePathname();
    const previousPathname = useRef<string>("");
    const posthog = usePostHog();

    useEffect(() => {
        if (!previousPathname.current) {
            previousPathname.current = pathname;
            return;
        }

        if (previousPathname.current !== pathname) {
            posthog.capture("page_viewed", {
                pathname,
                previous_pathname: previousPathname.current,
            });

            previousPathname.current = pathname;
        }
    }, [pathname, posthog]);

    return null;
}

function RootLayoutComponent() {
    const { isLoaded: authLoaded } = useAuth();
    const { user } = useUser();
    const userId = user?.id;

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

    useEffect(() => {
        const email = user?.emailAddresses[0]?.emailAddress!;

        if (userId && posthog) {
            posthog.identify(userId, { email });
        }
    }, [userId, user]);

    if ((!fontsLoaded && !error) || !authLoaded) {
        return null;
    }

    const router = <Stack screenOptions={{ headerShown: false }} />;

    const app = posthog ? (
        <PostHogProvider
            client={posthog}
            autocapture={{
                captureScreens: false,
                captureTouches: true,
                propsToCapture: ["testId"],
            }}
        >
            <RouteChangeTracker />
            {router}
        </PostHogProvider>
    ) : (
        router
    );

    return (
        <QueryClientProvider client={queryClient}>
            {app}
            <AppToast />
        </QueryClientProvider>
    );
}

export default function RootLayout() {
    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <RootLayoutComponent />
        </ClerkProvider>
    );
}
