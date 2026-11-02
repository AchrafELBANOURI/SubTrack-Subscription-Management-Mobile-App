import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const missingVariable = !projectToken
    ? "EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN"
    : !host
      ? "EXPO_PUBLIC_POSTHOG_HOST"
      : undefined;

if (missingVariable && __DEV__) {
    throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
}

export const posthog =
    projectToken && host
        ? new PostHog(projectToken, {
              host,
              logs: {
                  serviceName: "subtrack-mobile",
                  environment: __DEV__ ? "development" : "production",
              },
              errorTracking: {
                  autocapture: {
                      uncaughtExceptions: true,
                      unhandledRejections: true,
                      console: [],
                  },
              },
          })
        : undefined;

export const posthogLogger = {
    info: (
        message: string,
        attributes: Record<string, string | number | boolean>,
    ) => posthog?.logger.info(message, attributes),
};
