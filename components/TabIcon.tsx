import { clsx } from "clsx";
import { Image, View } from "react-native";

const TabIcon = ({ focused, icon }: TabIconProps) => (
  <View className="tabs-icon">
    <View className={clsx("tabs-pill", focused && "tabs-active")}>
      <Image source={icon} resizeMode="contain" className="tabs-glyph" />
    </View>
  </View>
);

export default TabIcon;
