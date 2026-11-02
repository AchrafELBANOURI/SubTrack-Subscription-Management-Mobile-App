import { type Href, router } from "expo-router";

type AuthNavigationParams = {
    session?: {
        currentTask?: unknown;
    };
    decorateUrl: (path: string) => string;
};

export const navigateToUrl = (url: string) => {
    if (url.startsWith("http")) {
        if (typeof window !== "undefined" && window.location) {
            window.location.href = url;
        } else {
            router.replace("/(tabs)" as Href);
        }

        return;
    }

    router.replace(url as Href);
};

export const navigateAfterAuth = ({
    session,
    decorateUrl,
}: AuthNavigationParams) => {
    if (session?.currentTask) {
        return;
    }

    navigateToUrl(decorateUrl("/(tabs)"));
};
