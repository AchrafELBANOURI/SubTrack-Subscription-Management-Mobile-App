import { Text, View, Pressable, Image } from "react-native";
import { useClerk, useUser } from "@clerk/expo";
import SafeScreen from "../../../components/SafeScreen";
import images from "../../../constants/images";
import { posthog } from "../../../lib/posthog";
import { useCurrentUserQuery } from "../../../lib/subscriptionQueries";
import { showErrorToast } from "../../../lib/toast";

const Settings = () => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const { data: currentUser } = useCurrentUserQuery();

    const handleSignOut = async () => {
        try {
            await signOut();
            posthog?.capture("user_signed_out");
            posthog?.reset();
        } catch {
            showErrorToast("You cannot sign out");
        }
    };

    const displayName =
        user?.firstName ||
        user?.fullName ||
        user?.emailAddresses[0]?.emailAddress ||
        "User";

    const email = currentUser?.email ?? user?.emailAddresses[0]?.emailAddress;

    return (
        <SafeScreen className="flex-1 bg-background p-5">
            <Text className="text-3xl font-sans-bold text-primary mb-6">
                Settings
            </Text>

            {/* User Profile Section */}
            <View className="auth-card mb-5">
                <View className="flex-row items-center gap-4 mb-4">
                    <Image
                        source={
                            user?.imageUrl
                                ? { uri: user.imageUrl }
                                : images.avatar
                        }
                        className="size-16 rounded-full"
                    />
                    <View className="flex-1">
                        <Text className="text-lg font-sans-bold text-primary">
                            {displayName}
                        </Text>
                        {email && (
                            <Text className="text-sm font-sans-medium text-muted-foreground">
                                {email}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Account Section */}
            <View className="auth-card mb-5">
                <Text className="text-base font-sans-semibold text-primary mb-3">
                    Account
                </Text>
                <View className="gap-2">
                    <View className="flex-row justify-between items-center py-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground">
                            Account ID
                        </Text>
                        <Text
                            className="text-sm font-sans-medium text-primary"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {currentUser?.clerkUserId?.substring(0, 20) ||
                                "N/A"}
                        </Text>
                    </View>
                    <View className="flex-row justify-between items-center py-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground">
                            Joined
                        </Text>
                        <Text className="text-sm font-sans-medium text-primary">
                            {currentUser?.createdAt
                                ? new Date(
                                      currentUser.createdAt,
                                  ).toLocaleDateString()
                                : "N/A"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Sign Out Button */}
            <Pressable
                className="auth-button bg-destructive"
                onPress={handleSignOut}
            >
                <Text className="auth-button-text text-white">Sign Out</Text>
            </Pressable>
        </SafeScreen>
    );
};

export default Settings;
