import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabIcon from "../../../components/TabIcon";
import { tabs } from "../../../constants/data";
import { colors, components } from "../../../constants/theme";

const tabBar = components.tabBar;

const TabLayout = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: colors.primary,
                    position: "absolute",
                    bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                    height: tabBar.height,
                    marginHorizontal: tabBar.horizontalInset,
                    borderRadius: tabBar.radius,
                    borderTopWidth: 0,
                    elevation: 0,
                    paddingBottom: 0,
                },
                tabBarIconStyle: {
                    marginVertical: "auto",
                    height: tabBar.iconFrame,
                    width: tabBar.iconFrame,
                },
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={tab.icon} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
};

export default TabLayout;
