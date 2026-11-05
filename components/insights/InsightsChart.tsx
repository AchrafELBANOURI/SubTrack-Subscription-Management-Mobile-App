import { Text, View } from "react-native";
import AnimatedBar from "./AnimatedBar";

interface InsightsChartProps {
    data: WeeklyDayExpense[];
    selectedDay: string | null;
    onSelectDay: (day: string) => void;
}

const Y_AXIS_LEVELS = [45, 40, 35, 30, 25, 20, 15, 10, 5, 0];

export default function InsightsChart({
    data,
    selectedDay,
    onSelectDay,
}: InsightsChartProps) {

    return (
        <View className="insights-chart-card">
            <View className="lg:h-44 h-60 flex-row relative">
                {/* Y-Axis Labels and Dashed Grid Lines */}
                <View className="absolute inset-0 justify-between h-full py-4 pointer-events-none">
                    {Y_AXIS_LEVELS.map((level) => (
                        <View
                            key={level}
                            className="flex-row items-center w-full"
                        >
                            <Text className="w-6 text-[10px] font-sans-medium text-primary/50 text-right pr-2">
                                {level}
                            </Text>
                            <View
                                className="flex-1 h-px border-b border-dashed border-primary/10"
                                style={{ borderStyle: "dashed" }}
                            />
                        </View>
                    ))}
                </View>

                {/* Bars Area */}
                <View className="flex-1 flex-row items-end justify-between ml-7 h-full">
                    {data?.map((item, index) => {
                        
                        const isSelected = selectedDay
                            ? selectedDay === item.day
                            : item.isPeak;

                        return (
                            <AnimatedBar
                                key={item.day}
                                item={item}
                                isSelected={isSelected}
                                index={index}
                                onPress={() => onSelectDay(item.day)}
                            />
                        );
                    })}
                </View>
            </View>
        </View>
    );
}
