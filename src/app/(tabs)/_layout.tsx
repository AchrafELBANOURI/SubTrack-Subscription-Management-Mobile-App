import clsx from "clsx";
import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tabs } from "../../../constants/data";
import { colors, components } from "../../../constants/theme";

const tabBar = components.tabBar;

const TabLayout = () => {
  const insets = useSafeAreaInsets(); // explain this

  const TabIcon = ({ focused, icon }: TabIconProps) => (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.primary,
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset), // explain this
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          borderTopWidth: 0,
          elevation: 0, // explain this
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          height: tabBar.iconFrame,
          width: tabBar.iconFrame,
          alignItems: "center",
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
              // TabBarIcon is like a wrapper think of it like a <View>...</View>
              // this wrapper will contain what this function return
              // and this function should return a React Node/Element
              // you could style this wrapper from tabBarIconStyle attribute from Tabs
              // Notice : Tabs Element holds ( TabBarItem Container which contains TabBarItems(TabBarIcons + TabBarLabel) )
              // You could style TabBarItem Container from TabBarItemStyle
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
