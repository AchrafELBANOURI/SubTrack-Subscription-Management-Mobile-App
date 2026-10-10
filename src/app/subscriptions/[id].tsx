import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeScreen } from "../../../components/SafeScreen";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeScreen className="screen-container">
      <Text>SubscriptionDetails : {id} </Text>
    </SafeScreen>
  );
};

export default SubscriptionDetails;
