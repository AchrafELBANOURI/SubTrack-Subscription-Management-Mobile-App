import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, error] = useFonts({
        "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
        "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
        "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded || error) {
            SplashScreen.hide();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded && !error) {
        return null;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
